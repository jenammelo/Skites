import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncGuests, GuestRow } from "@/lib/sync-guests";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { rows } = (await req.json()) as { rows: GuestRow[] };

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Expected a list of rows." }, { status: 400 });
  }

  const cleaned = rows.filter((r) => r.name?.trim() && r.table?.trim());
  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Every row needs at least a name and a table." }, { status: 422 });
  }

  const summary = await syncGuests(eventId, cleaned);
  await logActivity(
    "seating_edited",
    `Seating plan edited for "${event.name}" — ${summary.created} added, ${summary.updated} updated, ${summary.removed} removed.`,
    eventId
  );
  const guests = await prisma.guest.findMany({
    where: { eventId },
    orderBy: [{ table: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ ...summary, guests });
}
