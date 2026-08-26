import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; guestId: string }> }
) {
  const { eventId, guestId } = await params;
  const { table, seat } = await req.json();

  const guest = await prisma.guest.findFirst({ where: { id: guestId, eventId } });
  if (!guest) return NextResponse.json({ error: "Guest not found." }, { status: 404 });

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: {
      table: typeof table === "string" && table.trim() ? table.trim() : guest.table,
      seat: typeof seat === "string" ? seat.trim() || null : guest.seat,
    },
  });

  return NextResponse.json({ guest: updated });
}
