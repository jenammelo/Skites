import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLiveEvent } from "@/lib/expiry";
import { rankByNameSimilarity } from "@/lib/fuzzy";

export const dynamic = "force-dynamic";

type Guest = { id: string; name: string; table: string; seat: string | null };

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query) return NextResponse.json({ results: [] });

  try {
    const event = await getLiveEvent(eventId);
    if (!event) {
      return NextResponse.json({ error: "This event has ended and its data has been removed." }, { status: 410 });
    }

    const guests = (await prisma.guest.findMany({ where: { eventId } })) as Guest[];
    if (guests.length === 0) return NextResponse.json({ results: [] });

    const url = process.env.PARSER_SERVICE_URL;
    if (url) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${url}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, candidates: guests }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            return NextResponse.json({ results: data.results });
          }
        }
      } catch (err) {
        console.error("[guest search] Python service failed, using local fallback:", err);
      }
    }

    const ranked = rankByNameSimilarity(query, guests)
      .filter((r) => r.score >= 0.4)
      .slice(0, 8)
      .map((r) => ({ id: r.id, name: r.name, table: r.table, seat: r.seat, score: Math.round(r.score * 100) }));

    return NextResponse.json({ results: ranked });
  } catch (err) {
    console.error("Guest search failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}