import { NextRequest, NextResponse } from "next/server";
import { getLiveEventByActivationCode } from "@/lib/expiry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const code = body.code;
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Enter your event code." }, { status: 400 });
  }

  try {
    const event = await getLiveEventByActivationCode(code.trim().toUpperCase());
    if (!event) {
      return NextResponse.json(
        { error: "This code is invalid, or the event has ended and its data has been removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({ eventId: event.id, eventName: event.name });
  } catch (err) {
    console.error("Activation failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}