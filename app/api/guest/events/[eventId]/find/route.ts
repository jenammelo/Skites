import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const name = req.nextUrl.searchParams.get("name")?.trim();
  if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const matches = (await prisma.guest.findMany({
    where: { eventId, name: { contains: name } },
    take: 5,
  })) as { id: string; name: string; table: string; seat: string | null }[];

  if (matches.length === 0) {
    return NextResponse.json({ found: false });
  }

  const exact = matches.find((m) => m.name.toLowerCase() === name.toLowerCase());
  const best = exact ?? matches[0];

  return NextResponse.json({
    found: true,
    guest: { id: best.id, name: best.name, table: best.table, seat: best.seat },
    alternatives: matches.length > 1 ? matches.filter((m) => m.id !== best.id).map((m) => m.name) : [],
  });
}
