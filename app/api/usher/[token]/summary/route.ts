import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const event = await prisma.event.findUnique({ where: { usherToken: token } });
  if (!event) return NextResponse.json({ error: "Invalid usher link." }, { status: 404 });

  const total = await prisma.guest.count({ where: { eventId: event.id } });
  const checkedIn = await prisma.guest.count({ where: { eventId: event.id, checkedIn: true } });

  return NextResponse.json({ eventName: event.name, total, checkedIn });
}
