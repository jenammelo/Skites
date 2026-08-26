import { prisma } from "@/lib/prisma";

export type ActivityType = "event_created" | "csv_uploaded" | "seating_edited" | "guest_checked_in";

export async function logActivity(type: ActivityType, message: string, eventId?: string) {
  try {
    await prisma.activityLog.create({ data: { type, message, eventId: eventId ?? null } });
  } catch {
    // best-effort — never let logging break the actual request
  }
}
