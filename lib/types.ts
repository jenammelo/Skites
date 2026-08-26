export type Guest = {
  id: string;
  name: string;
  table: string;
  seat?: string;
};

export type EntryStatus = "not_checked_in" | "checked_in";

export type UsherGuest = Guest & { status: EntryStatus };

export type EventSummary = {
  id: string;
  name: string;
  organizer: string;
  date: string;
  status: "Active" | "Draft" | "Expired";
  guests: number;
  checkedIn: number;
  usherActive: boolean;
};

export const QR_COLORS = [
  { name: "Black", hex: "#14161A" },
  { name: "Indigo", hex: "#4338CA" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#15803D" },
  { name: "Red", hex: "#B91C1C" },
] as const;
