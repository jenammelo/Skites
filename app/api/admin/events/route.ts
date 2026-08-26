import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateActivationCode, generateUsherToken } from "@/lib/codes";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET() {
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
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, organizerName, whatsapp, email, eventDate } = body ?? {};

  if (!name || !organizerName) {
    return NextResponse.json({ error: "Event name and organizer name are required." }, { status: 400 });
  }

  let activationCode = generateActivationCode();
  // extremely unlikely, but guard against collision
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
      eventDate: eventDate || null,
      activationCode,
      usherToken: generateUsherToken(),
      status: "Draft",
    },
  });

  await logActivity("event_created", `Event "${event.name}" created by ${organizerName}.`, event.id);

  return NextResponse.json({ event }, { status: 201 });
}
