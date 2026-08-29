import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLiveEventByUsherToken } from "@/lib/expiry";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const event = await getLiveEventByUsherToken(token);
    if (!event) return NextResponse.json({ error: "This event has ended and its data has been removed." }, { status: 410 });

    const total = await prisma.guest.count({ where: { eventId: event.id } });
    const checkedIn = await prisma.guest.count({ where: { eventId: event.id, checkedIn: true } });

    return NextResponse.json({ eventName: event.name, total, checkedIn });
  } catch (err) {
    console.error("Usher summary failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}