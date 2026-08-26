import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseGuestCsv } from "@/lib/csv";
import { syncGuests } from "@/lib/sync-guests";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const guests = await prisma.guest.findMany({
    where: { eventId },
    orderBy: [{ table: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ guests });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { csv } = await req.json();
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "No CSV content received." }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const result = parseGuestCsv(csv);
  if (result.guests.length === 0) {
    return NextResponse.json(
      { error: result.errors[0] ?? "No valid guest rows found.", errors: result.errors },
      { status: 422 }
    );
  }

  // Matches existing guests by name so anyone already checked in stays
  // checked in — a re-upload only adds/updates/removes, it never resets
  // the door state.
  const sync = await syncGuests(eventId, result.guests);
  await logActivity(
    "csv_uploaded",
    `CSV uploaded for "${event.name}" — ${sync.created} added, ${sync.updated} updated, ${sync.removed} removed.`,
    eventId
  );

  const tableCount = new Set(result.guests.map((g) => g.table)).size;

  return NextResponse.json({
    imported: result.guests.length,
    tables: tableCount,
    skipped: result.skipped,
    errors: result.errors,
  });
}
