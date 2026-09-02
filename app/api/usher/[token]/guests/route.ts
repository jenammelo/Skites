import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLiveEventByUsherToken } from "@/lib/expiry";
import { rankByNameSimilarity } from "@/lib/fuzzy";

export const dynamic = "force-dynamic";

type Guest = { id: string; name: string; table: string; seat: string | null; checkedIn: boolean };

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const event = await getLiveEventByUsherToken(token);
    if (!event) return NextResponse.json({ error: "This event has ended and its data has been removed." }, { status: 410 });

    const query = req.nextUrl.searchParams.get("query")?.trim();
    if (!query) return NextResponse.json({ guests: [] });

    const allGuests = (await prisma.guest.findMany({ where: { eventId: event.id } })) as Guest[];
    if (allGuests.length === 0) return NextResponse.json({ guests: [] });

    const checkedInById = new Map(allGuests.map((g) => [g.id, g.checkedIn]));

    const url = process.env.PARSER_SERVICE_URL;
    if (url) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${url}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, candidates: allGuests }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            const guests = data.results.map((r: { id: string; name: string; table: string; seat: string | null }) => ({
              id: r.id,
              name: r.name,
              table: r.table,
              seat: r.seat,
              checkedIn: checkedInById.get(r.id) ?? false,
            }));
            return NextResponse.json({ guests });
          }
        }
      } catch (err) {
        console.error("[usher search] Python service failed, using local fallback:", err);
      }
    }

    // Fallback: same normalized Levenshtein ranking the guest portal uses
    // when Python is unavailable — case, spaces, and accents all ignored.
    const ranked = rankByNameSimilarity(query, allGuests)
      .filter((r) => r.score >= 0.4)
      .slice(0, 15)
      .map((r) => ({ id: r.id, name: r.name, table: r.table, seat: r.seat, checkedIn: r.checkedIn }));

    return NextResponse.json({ guests: ranked });
  } catch (err) {
    console.error("Usher guest search failed:", err);
    return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}