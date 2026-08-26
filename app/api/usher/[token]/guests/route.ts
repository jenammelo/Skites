import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const event = await prisma.event.findUnique({ where: { usherToken: token } });
  if (!event) return NextResponse.json({ error: "Invalid usher link." }, { status: 404 });

  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query) return NextResponse.json({ guests: [] });

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id, name: { contains: query } },
    take: 15,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ guests });
}
