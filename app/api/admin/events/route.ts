import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateActivationCode, generateUsherToken } from "@/lib/codes";
import { logActivity } from "@/lib/activity";
import { purgeAllExpired } from "@/lib/expiry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await purgeAllExpired();

    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { guests: true } } },
    });

    const withCounts = await Promise.all(
      events.map(async (e: (typeof events)[number]) => {
        const checkedIn = await prisma.guest.count({ where: { eventId: e.id, checkedIn: true } });
        return {
          id: e.id,
          name: e.name,
          organizer: e.organizerName,
          date: e.eventDate,
          status: e.status,
          guests: e._count.guests,
          checkedIn,
          activationCode: e.activationCode,
        };
      })
    );

    return NextResponse.json({ events: withCounts });
  } catch (err) {
    console.error("Admin events list failed:", err);
    return NextResponse.json({ error: "Couldn't load events. Try again in a moment." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: { name?: string; organizerName?: string; whatsapp?: string; email?: string; eventDate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { name, organizerName, whatsapp, email, eventDate } = body;

  if (!name || !organizerName) {
    return NextResponse.json({ error: "Event name and organizer name are required." }, { status: 400 });
  }
  if (!eventDate) {
    return NextResponse.json({ error: "Event date is required — it sets the 48-hour live window." }, { status: 400 });
  }
  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "That event date isn't valid." }, { status: 400 });
  }

  try {
    let activationCode = generateActivationCode();
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.event.findUnique({ where: { activationCode } });
      if (!clash) break;
      activationCode = generateActivationCode();
    }

    const event = await prisma.event.create({
      data: {
        name,
        organizerName,
        whatsapp: whatsapp || null,
        email: email || null,
        eventDate: parsedDate,
        activationCode,
        usherToken: generateUsherToken(),
        status: "Draft",
      },
    });

    await logActivity("event_created", `Event "${event.name}" created by ${organizerName}.`, event.id);

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("Event creation failed:", err);
    return NextResponse.json({ error: "Something went wrong creating the event. Try again." }, { status: 500 });
  }
}