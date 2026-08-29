import { prisma } from "@/lib/prisma";

export const EVENT_LIVE_HOURS = 48;

export function computeExpiresAt(eventDate: Date): Date {
  return new Date(eventDate.getTime() + EVENT_LIVE_HOURS * 60 * 60 * 1000);
}

export function isExpired(eventDate: Date): boolean {
  return Date.now() > computeExpiresAt(eventDate).getTime();
}

/**
 * Loads an event by id. If it's past its 48-hour live window, deletes it
 * (cascades to guests, check-ins, activity log rows) and returns null
 * instead of exposing stale data. This is how the automatic wipe
 * actually happens — lazily, the next time anything touches the event.
 */
export async function getLiveEvent(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;
  if (isExpired(event.eventDate)) {
    await prisma.event.delete({ where: { id: eventId } }).catch(() => {});
    return null;
  }
  return event;
}

export async function getLiveEventByActivationCode(code: string) {
  const event = await prisma.event.findUnique({ where: { activationCode: code } });
  if (!event) return null;
  if (isExpired(event.eventDate)) {
    await prisma.event.delete({ where: { id: event.id } }).catch(() => {});
    return null;
  }
  return event;
}

export async function getLiveEventByUsherToken(token: string) {
  const event = await prisma.event.findUnique({ where: { usherToken: token } });
  if (!event) return null;
  if (isExpired(event.eventDate)) {
    await prisma.event.delete({ where: { id: event.id } }).catch(() => {});
    return null;
  }
  return event;
}

/** Sweeps every event and deletes any that are past their 48-hour window. Used on the Admin events list. */
export async function purgeAllExpired(): Promise<number> {
  const events = await prisma.event.findMany({ select: { id: true, eventDate: true } });
  const expiredIds = events.filter((e) => isExpired(e.eventDate)).map((e) => e.id);
  if (expiredIds.length > 0) {
    await prisma.event.deleteMany({ where: { id: { in: expiredIds } } });
  }
  return expiredIds.length;
}