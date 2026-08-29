import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLiveEventByUsherToken } from "@/lib/expiry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const event = await getLiveEventByUsherToken(token);
    if (!event) return NextResponse.json({ error: "This event has ended and its data has been removed." }, { status: 410 });

    const query = req.nextUrl.searchParams.get("query")?.trim();
    if (!query) return NextResponse.json({ guests: [] });

    const guests = await prisma.guest.findMany({
      where: { eventId: event.id, name: { contains: query } },
      take: 15,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ guests });
  } catch (err) {
    console.error("Usher guest search failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}