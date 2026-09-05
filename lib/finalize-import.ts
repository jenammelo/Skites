import { prisma } from "@/lib/prisma";
import { syncGuests, GuestRow } from "@/lib/sync-guests";
import { logActivity } from "@/lib/activity";

const REPLACE_LIMIT = 2;

type RawRow = { name?: string; table?: string; seat?: string | null };

export async function finalizeGuestImport(eventId: string, rawGuests: RawRow[], fileName?: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { status: 404 as const, body: { error: "Event not found." } };

  const existingCount = await prisma.guest.count({ where: { eventId } });
  const isReplace = existingCount > 0;

  if (isReplace && event.csvReplaceCount >= REPLACE_LIMIT) {
    return {
      status: 403 as const,
      body: {
        error:
          "You've used both free replacements for this event. Message the Skites team on WhatsApp for help with a corrected file.",
        limitReached: true,
      },
    };
  }

  // Deliberately ignore any "id" the parser attaches — those are just row
  // numbers from the file, not real database ids, and must never be used
  // to match against existing guests. Matching is name-based here.
  const cleaned: GuestRow[] = rawGuests
    .map((g) => ({
      name: g.name?.toString().trim() ?? "",
      table: g.table?.toString().trim() ?? "",
      seat: g.seat?.toString().trim() || null,
    }))
    .filter((g) => g.name && g.table);

  if (cleaned.length === 0) {
    return { status: 422 as const, body: { error: "No valid guest rows found in that file." } };
  }

  const sync = await syncGuests(eventId, cleaned);

  const updateData: { lastFileName?: string; csvReplaceCount?: number } = {};
  if (fileName) updateData.lastFileName = fileName;
  if (isReplace) updateData.csvReplaceCount = event.csvReplaceCount + 1;
  if (Object.keys(updateData).length > 0) {
    await prisma.event.update({ where: { id: eventId }, data: updateData });
  }

  const replacesUsed = isReplace ? event.csvReplaceCount + 1 : event.csvReplaceCount;

  await logActivity(
    isReplace ? "seating_edited" : "csv_uploaded",
    isReplace
      ? `Seating plan replaced for "${event.name}" (${replacesUsed}/${REPLACE_LIMIT} replacements used) — ${sync.created} added, ${sync.updated} updated, ${sync.removed} removed.`
      : `File uploaded for "${event.name}" — ${cleaned.length} guests imported.`,
    eventId
  );

  const tableCount = new Set(cleaned.map((g) => g.table)).size;

  return {
    status: 200 as const,
    body: {
      imported: cleaned.length,
      tables: tableCount,
      skipped: rawGuests.length - cleaned.length,
      errors: [] as string[],
      isReplace,
      replacesUsed,
      replacesLimit: REPLACE_LIMIT,
      fileName: fileName ?? event.lastFileName,
    },
  };
}