import { NextRequest, NextResponse } from "next/server";
import { getLiveEvent } from "@/lib/expiry";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const event = await getLiveEvent(eventId);
    if (!event) {
      return NextResponse.json({ error: "This event has ended and its data has been removed." }, { status: 410 });
    }

    return NextResponse.json({ usherToken: event.usherToken, eventName: event.name });
  } catch (err) {
    console.error("Usher link lookup failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}