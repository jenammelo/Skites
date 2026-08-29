import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const event = await prisma.event.findUnique({ where: { usherToken: token } });
  if (!event) return NextResponse.json({ error: "Invalid usher link." }, { status: 404 });

  const { guestId, override } = await req.json();
  const guest = await prisma.guest.findFirst({ where: { id: guestId, eventId: event.id } });
  if (!guest) return NextResponse.json({ error: "Guest not found." }, { status: 404 });

  // Anti-fraud guard: this is the real gate — the guest portal itself
  // can't let anyone in, so this is where a second/impersonated attempt
  // to use someone's name actually gets stopped. Requires an explicit
  // override from the usher (who has visually verified the person) to
  // proceed a second time, and every override is logged for the record.
  if (guest.checkedIn && !override) {
    return NextResponse.json(
      {
        alreadyCheckedIn: true,
        checkedInAt: guest.checkedInAt,
        error: `${guest.name} was already checked in.`,
      },
      { status: 409 }
    );
  }

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: { checkedIn: true, checkedInAt: new Date() },
  });

  await prisma.entry.create({
    data: { eventId: event.id, guestId: guest.id, guestName: guest.name },
  });

  await logActivity(
    guest.checkedIn && override ? "guest_checked_in" : "guest_checked_in",
    guest.checkedIn && override
      ? `⚠️ ${guest.name} was checked in a SECOND time at "${event.name}" (usher override — possible impersonation, verify in person).`
      : `${guest.name} checked in at "${event.name}".`,
    event.id
  );

  const total = await prisma.guest.count({ where: { eventId: event.id } });
  const checkedIn = await prisma.guest.count({ where: { eventId: event.id, checkedIn: true } });

  return NextResponse.json({ guest: updated, total, checkedIn });
}