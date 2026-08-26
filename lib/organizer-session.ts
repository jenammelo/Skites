"use client";

const KEY = "skites_organizer_event";

export type OrganizerSession = { eventId: string; eventName: string };

export function saveOrganizerSession(session: OrganizerSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function getOrganizerSession(): OrganizerSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OrganizerSession;
  } catch {
    return null;
  }
}

export function clearOrganizerSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
