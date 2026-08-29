"use client";

const EVENTS_KEY = "skites_organizer_events";
const ACTIVE_KEY = "skites_organizer_active_event";

export type OrganizerEvent = { eventId: string; eventName: string };

function readEvents(): OrganizerEvent[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEvents(events: OrganizerEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

/** All events this organizer has activated on this device. */
export function getOrganizerEvents(): OrganizerEvent[] {
  return readEvents();
}

/** Adds a newly-activated event to the list (no-op if already present) and marks it active. */
export function addOrganizerEvent(event: OrganizerEvent) {
  const events = readEvents();
  if (!events.some((e) => e.eventId === event.eventId)) {
    writeEvents([...events, event]);
  }
  setActiveOrganizerEvent(event);
}

export function removeOrganizerEvent(eventId: string) {
  writeEvents(readEvents().filter((e) => e.eventId !== eventId));
}

/** "Active" event = whichever one the organizer just opened (drives the QR / Contact pages). */
export function setActiveOrganizerEvent(event: OrganizerEvent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(event));
}

export function getActiveOrganizerEvent(): OrganizerEvent | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ACTIVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OrganizerEvent;
  } catch {
    return null;
  }
}

// Back-compat names — QRPage, ContactPage, and the layout guard only ever
// cared about "the current event", so they keep working unchanged.
export const getOrganizerSession = getActiveOrganizerEvent;
export const saveOrganizerSession = addOrganizerEvent;

export function clearOrganizerSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(EVENTS_KEY);
  window.localStorage.removeItem(ACTIVE_KEY);
}