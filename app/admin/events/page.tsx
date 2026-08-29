import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { guests: true } } },
  });

  const rows = await Promise.all(
    events.map(async (e: (typeof events)[number]) => ({
      ...e,
      checkedIn: await prisma.guest.count({ where: { eventId: e.id, checkedIn: true } }),
    }))
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight2">Events</h1>
        <Link href="/admin/events/new">
          <Button>
            <Plus size={16} /> Create Event
          </Button>
        </Link>
      </div>

      {rows.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">No events yet — create your first one.</p>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-ink">{e.name}</p>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  e.status === "Active" && "bg-good/10 text-good",
                  e.status === "Draft" && "border border-line text-muted",
                  e.status === "Expired" && "bg-red-50 text-red-700"
                )}
              >
                {e.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Organizer: {e.organizerName}
      {` · Live until: ${new Date(new Date(e.eventDate).getTime() + 48 * 60 * 60 * 1000).toLocaleString()}`}
            </p>
            <div className="tabular mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/80">
              <span>{e._count.guests} guests</span>
              <span>{e.checkedIn} checked in</span>
              <span className="font-mono text-xs text-muted">{e.activationCode}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
