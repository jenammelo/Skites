import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseGuestCsvSmart } from "@/lib/csv";
import { finalizeGuestImport } from "@/lib/finalize-import";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const guests = await prisma.guest.findMany({
    where: { eventId },
    orderBy: [{ table: "asc" }, { name: "asc" }],
  });
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  return NextResponse.json({
    guests,
    fileName: event?.lastFileName ?? null,
    replacesUsed: event?.csvReplaceCount ?? 0,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { csv, fileName } = await req.json();
  if (!csv || typeof csv !== "string" || !csv.trim()) {
    return NextResponse.json({ error: "No CSV content received." }, { status: 400 });
  }

  const result = await parseGuestCsvSmart(csv);
  if (result.guests.length === 0) {
    return NextResponse.json(
      { error: result.errors[0] ?? "No valid guest rows found.", errors: result.errors },
      { status: 422 }
    );
  }

  const outcome = await finalizeGuestImport(eventId, result.guests, fileName);
  return NextResponse.json(
    { ...outcome.body, errors: result.errors, skipped: result.skipped },
    { status: outcome.status }
  );
}