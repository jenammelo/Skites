import { prisma } from "@/lib/prisma";
import { Check, Upload, Table as TableIcon, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const ICONS: Record<string, typeof Check> = {
  event_created: PlusCircle,
  csv_uploaded: Upload,
  seating_edited: TableIcon,
  guest_checked_in: Check,
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function ActivityPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8">
      <h1 className="text-xl font-semibold tracking-tight2">Activity</h1>
      <p className="mt-1 text-sm text-muted">Everything happening across every event, most recent first.</p>

      {logs.length === 0 && <p className="mt-8 text-center text-sm text-muted">No activity yet.</p>}

      <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-white">
        {logs.map((log: (typeof logs)[number]) => {
          const Icon = ICONS[log.type] ?? Check;
          return (
            <li key={log.id} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper border border-line">
                <Icon size={13} strokeWidth={1.75} className="text-ink/70" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">{log.message}</p>
                <p className="tabular mt-0.5 text-xs text-muted">{timeAgo(log.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
