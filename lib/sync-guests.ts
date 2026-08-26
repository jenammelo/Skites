import { prisma } from "@/lib/prisma";

export type GuestRow = { id?: string; name: string; table: string; seat?: string | null };

type ExistingGuest = { id: string; name: string; table: string; seat: string | null };

/**
 * Reconciles an event's guest list with a new set of rows (from a CSV
 * re-upload or the spreadsheet editor) WITHOUT destroying rows that match
 * an existing guest — so `checkedIn` / `checkedInAt` survive last-minute
 * edits instead of being reset to false for everyone.
 *
 * Matching priority: by `id` when the row came from the grid editor
 * (editing an already-loaded guest), falling back to a case-insensitive
 * name match when the row came from a CSV re-upload (no ids). Anything
 * left over after matching is a guest that's no longer in the new list
 * and gets removed; anything new gets created fresh (checkedIn: false).
 */
export async function syncGuests(eventId: string, rows: GuestRow[]) {
  const existing = (await prisma.guest.findMany({ where: { eventId } })) as ExistingGuest[];
  const byId = new Map(existing.map((g) => [g.id, g]));
  const byName = new Map(existing.map((g) => [g.name.trim().toLowerCase(), g]));
  const matched = new Set<string>();

  const updates: { id: string; name: string; table: string; seat: string | null }[] = [];
  const creates: { name: string; table: string; seat: string | null }[] = [];

  for (const row of rows) {
    const name = row.name.trim();
    const table = row.table.trim();
    const seat = row.seat?.trim() || null;
    if (!name || !table) continue;

    let match = row.id ? byId.get(row.id) : undefined;
    if (!match) match = byName.get(name.toLowerCase());

    if (match && !matched.has(match.id)) {
      matched.add(match.id);
      updates.push({ id: match.id, name, table, seat });
    } else {
      creates.push({ name, table, seat });
    }
  }

  const toDelete = existing.filter((g) => !matched.has(g.id)).map((g) => g.id);

  await prisma.$transaction([
    ...updates.map((u) =>
      prisma.guest.update({ where: { id: u.id }, data: { name: u.name, table: u.table, seat: u.seat } })
    ),
    ...(creates.length ? [prisma.guest.createMany({ data: creates.map((c) => ({ ...c, eventId })) })] : []),
    ...(toDelete.length ? [prisma.guest.deleteMany({ where: { id: { in: toDelete } } })] : []),
  ]);

  return { updated: updates.length, created: creates.length, removed: toDelete.length };
}
