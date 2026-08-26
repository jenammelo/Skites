import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Enter your event code." }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { activationCode: code.trim().toUpperCase() } });
  if (!event) {
    return NextResponse.json({ error: "We couldn't verify this event code." }, { status: 404 });
  }

  if (event.status === "Draft") {
    await prisma.event.update({ where: { id: event.id }, data: { status: "Active" } });
  }

  return NextResponse.json({ eventId: event.id, eventName: event.name });
}
