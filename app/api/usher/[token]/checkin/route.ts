import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLiveEventByUsherToken } from "@/lib/expiry";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const event = await getLiveEventByUsherToken(token);
    if (!event) return NextResponse.json({ error: "This event has ended and its data has been removed." }, { status: 410 });

    const { guestId } = await req.json();
    const guest = await prisma.guest.findFirst({ where: { id: guestId, eventId: event.id } });
    if (!guest) return NextResponse.json({ error: "Guest not found." }, { status: 404 });

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: { checkedIn: true, checkedInAt: new Date() },
    });

    await prisma.entry.create({
      data: { eventId: event.id, guestId: guest.id, guestName: guest.name },
    });
    await logActivity("guest_checked_in", `${guest.name} checked in at "${event.name}".`, event.id);

    const total = await prisma.guest.count({ where: { eventId: event.id } });
    const checkedIn = await prisma.guest.count({ where: { eventId: event.id, checkedIn: true } });

    return NextResponse.json({ guest: updated, total, checkedIn });
  } catch (err) {
    console.error("Check-in failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}