import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseGuestCsv, parseGuestCsvSmart } from "@/lib/csv";
import { syncGuests } from "@/lib/sync-guests";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

const REPLACE_LIMIT = 2;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const guests = await prisma.guest.findMany({
      where: { eventId },
      orderBy: [{ table: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      guests,
      fileName: event.lastFileName,
      replacesUsed: event.csvReplaceCount,
      replacesLimit: REPLACE_LIMIT,
    });
  } catch (err) {
    console.error("GET guests failed:", err);
    return NextResponse.json({ error: "Couldn't load your seating plan. Try again in a moment." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  let eventId: string;
  try {
    ({ eventId } = await params);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let body: { csv?: string; fileName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const { csv, fileName } = body;
  if (!csv || typeof csv !== "string" || !csv.trim()) {
    return NextResponse.json({ error: "No file content received. Try selecting the file again." }, { status: 400 });
  }

  let event;
  try {
    event = await prisma.event.findUnique({ where: { id: eventId } });
  } catch (err) {
    console.error("Event lookup failed:", err);
    return NextResponse.json({ error: "Couldn't reach the database. Try again in a moment." }, { status: 500 });
  }
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  let existingCount: number;
  try {
    existingCount = await prisma.guest.count({ where: { eventId } });
  } catch (err) {
    console.error("Guest count failed:", err);
    return NextResponse.json({ error: "Couldn't check your current seating plan. Try again." }, { status: 500 });
  }

  const isReplace = existingCount > 0;

  if (isReplace && event.csvReplaceCount >= REPLACE_LIMIT) {
    return NextResponse.json(
      {
        error:
          "You've used both free replacements for this event. Message the Skites team on WhatsApp and we'll help you upload a corrected file.",
        limitReached: true,
      },
      { status: 403 }
    );
  }

  let result;
  try {
 result = await parseGuestCsvSmart(csv);
  } catch (err) {
    console.error("CSV parse failed:", err);
    return NextResponse.json({ error: "We couldn't read that file. Make sure it's a valid CSV or Excel export." }, { status: 422 });
  }

  if (result.guests.length === 0) {
    return NextResponse.json(
      { error: result.errors[0] ?? "No valid guest rows found.", errors: result.errors },
      { status: 422 }
    );
  }

  try {
    const sync = await syncGuests(eventId, result.guests);

    const updateData: { lastFileName?: string; csvReplaceCount?: number } = {};
    if (fileName) updateData.lastFileName = fileName;
    if (isReplace) updateData.csvReplaceCount = event.csvReplaceCount + 1;

    if (Object.keys(updateData).length > 0) {
      await prisma.event.update({ where: { id: eventId }, data: updateData });
    }

    const replacesUsed = isReplace ? event.csvReplaceCount + 1 : event.csvReplaceCount;

    await logActivity(
      isReplace ? "seating_edited" : "csv_uploaded",
      isReplace
        ? `Seating plan replaced for "${event.name}" (${replacesUsed}/${REPLACE_LIMIT} replacements used) — ${sync.created} added, ${sync.updated} updated, ${sync.removed} removed.`
        : `CSV uploaded for "${event.name}" — ${sync.created} guests imported.`,
      eventId
    );

    const tableCount = new Set(result.guests.map((g) => g.table)).size;

    return NextResponse.json({
      imported: result.guests.length,
      tables: tableCount,
      skipped: result.skipped,
      errors: result.errors,
      isReplace,
      replacesUsed,
      replacesLimit: REPLACE_LIMIT,
      fileName: fileName ?? event.lastFileName,
    });
  } catch (err) {
    console.error("Guest sync failed:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your seating plan. Nothing was changed — try again." },
      { status: 500 }
    );
  }
}