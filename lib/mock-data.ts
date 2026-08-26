import { Guest, UsherGuest, EventSummary } from "./types";

export const mockGuests: Guest[] = [
  { id: "1", name: "John Doe", table: "Table 01", seat: "A1" },
  { id: "2", name: "Sarah Doe", table: "Table 01", seat: "A2" },
  { id: "3", name: "Michael Smith", table: "Table 01", seat: "A3" },
  { id: "4", name: "David Johnson", table: "Table 02", seat: "B1" },
  { id: "5", name: "Mary Johnson", table: "Table 02", seat: "B2" },
  { id: "6", name: "Peter Smith", table: "Table 02", seat: "B3" },
];

export const mockUshers: UsherGuest[] = [
  { id: "1", name: "John Doe", table: "Table 14", seat: "B4", status: "not_checked_in" },
  { id: "2", name: "Amara Nkeng", table: "Table 03", seat: "A2", status: "checked_in" },
  { id: "3", name: "Paul Etoa", table: "Table 07", seat: "C1", status: "checked_in" },
];

export const mockEvents: EventSummary[] = [
  { id: "1", name: "Sarah & David Wedding", organizer: "Sarah", date: "24 Oct", status: "Active", guests: 350, checkedIn: 184, usherActive: true },
  { id: "2", name: "MTN Corporate Dinner", organizer: "Linda", date: "02 Nov", status: "Draft", guests: 120, checkedIn: 0, usherActive: false },
  { id: "3", name: "Annual Gala 2026", organizer: "Eric", date: "14 Jan", status: "Active", guests: 480, checkedIn: 480, usherActive: true },
];
