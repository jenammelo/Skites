import { parse } from "csv-parse/sync";

export type ParsedGuest = { name: string; table: string; seat?: string };
export type CsvResult = { guests: ParsedGuest[]; errors: string[]; skipped: number };

const NAME_KEYS = ["name", "guest", "guest name", "full name"];
const TABLE_KEYS = ["table", "table name", "table number", "table no"];
const SEAT_KEYS = ["seat", "seat number", "seat no"];

function findKey(row: Record<string, string>, candidates: string[]) {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const hit = keys.find((k) => k.trim().toLowerCase() === c);
    if (hit) return hit;
  }
  return null;
}

export function parseGuestCsv(csvText: string): CsvResult {
  let rows: Record<string, string>[];
  try {
    rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (e) {
    return { guests: [], errors: [`Could not read the CSV file: ${(e as Error).message}`], skipped: 0 };
  }

  if (rows.length === 0) {
    return { guests: [], errors: ["The file has no guest rows."], skipped: 0 };
  }

  const nameKey = findKey(rows[0], NAME_KEYS);
  const tableKey = findKey(rows[0], TABLE_KEYS);
  const seatKey = findKey(rows[0], SEAT_KEYS);

  if (!nameKey || !tableKey) {
    return {
      guests: [],
      errors: ["Couldn't find both a name column and a table column. Expected headers like Name, Table, Seat."],
      skipped: 0,
    };
  }

  const guests: ParsedGuest[] = [];
  const errors: string[] = [];
  let skipped = 0;

  rows.forEach((row, i) => {
    const name = row[nameKey]?.trim();
    const table = row[tableKey]?.trim();
    const seat = seatKey ? row[seatKey]?.trim() : undefined;

    if (!name || !table) {
      skipped++;
      if (errors.length < 8) errors.push(`Row ${i + 2}: missing ${!name ? "name" : "table"}, skipped.`);
      return;
    }
    guests.push({ name, table, seat: seat || undefined });
  });

  return { guests, errors, skipped };
}
