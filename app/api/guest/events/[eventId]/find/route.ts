import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLiveEvent } from "@/lib/expiry";
import { rankByNameSimilarity } from "@/lib/fuzzy";

export const dynamic = "force-dynamic";

const MATCH_THRESHOLD = 0.6; // below this, we don't consider it "found"

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const name = req.nextUrl.searchParams.get("name")?.trim();
  if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });

  try {
    const event = await getLiveEvent(eventId);
    if (!event) {
      return NextResponse.json({ error: "This event has ended and its data has been removed." }, { status: 410 });
    }

    const allGuests = (await prisma.guest.findMany({ where: { eventId } })) as {
      id: string;
      name: string;
      table: string;
      seat: string | null;
    }[];

    if (allGuests.length === 0) {
      return NextResponse.json({ found: false });
    }

    const ranked = rankByNameSimilarity(name, allGuests);
    const best = ranked[0];

    if (!best || best.score < MATCH_THRESHOLD) {
      return NextResponse.json({ found: false });
    }

    const alternatives = ranked
      .slice(1, 4)
      .filter((r) => r.score >= MATCH_THRESHOLD - 0.15)
      .map((r) => r.name);

    return NextResponse.json({
      found: true,
      guest: { id: best.id, name: best.name, table: best.table, seat: best.seat },
      alternatives,
    });
  } catch (err) {
    console.error("Guest find failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}