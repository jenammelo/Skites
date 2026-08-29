import { parse } from "csv-parse/sync";

export type ParsedGuest = { name: string; table: string; seat?: string };
export type CsvResult = { guests: ParsedGuest[]; errors: string[]; skipped: number };

/**
 * Strips accents (é → e, ç → c, …) and anything that isn't a letter or
 * digit, then lowercases — so "Numéro de Table", "numero_de_table", and
 * "N° Table" all collapse to something we can keyword-match reliably.
 */
function normalize(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// "table" is the same word in French and English, so one keyword covers
// both — this is checked FIRST, before name/seat, so a column like
// "Table Name" is correctly claimed as the table column and not
// mistaken for the guest-name column.
const TABLE_KEYWORDS = ["table"];

// Seat: English "seat", French "siège"/"place"/"chaise" (all common on
// French invitation/seating exports).
const SEAT_KEYWORDS = ["seat", "siege", "place", "chaise"];

// Name: English "name"/"guest", French "nom"/"invite" (matches
// "invité"/"invitee" once accents are stripped).
const NAME_KEYWORDS = ["name", "guest", "nom", "invite"];

type Classified = { nameKey: string | null; tableKey: string | null; seatKey: string | null };

function classifyHeaders(headers: string[]): Classified {
  const claimed = new Set<string>();
  let tableKey: string | null = null;
  let seatKey: string | null = null;
  let nameKey: string | null = null;

  // Pass 1 — table (most distinctive keyword, claimed first so "Table
  // Name" doesn't later get mistaken for the guest name column)
  for (const h of headers) {
    if (claimed.has(h)) continue;
    if (TABLE_KEYWORDS.some((k) => normalize(h).includes(k))) {
      tableKey = h;
      claimed.add(h);
      break;
    }
  }

  // Pass 2 — seat
  for (const h of headers) {
    if (claimed.has(h)) continue;
    if (SEAT_KEYWORDS.some((k) => normalize(h).includes(k))) {
      seatKey = h;
      claimed.add(h);
      break;
    }
  }

  // Pass 3 — name (most generic keyword set, checked last)
  for (const h of headers) {
    if (claimed.has(h)) continue;
    if (NAME_KEYWORDS.some((k) => normalize(h).includes(k))) {
      nameKey = h;
      claimed.add(h);
      break;
    }
  }

  return { nameKey, tableKey, seatKey };
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
    return { guests: [], errors: [`Could not read the file: ${(e as Error).message}`], skipped: 0 };
  }

  if (rows.length === 0) {
    return { guests: [], errors: ["The file has no guest rows."], skipped: 0 };
  }

  const headers = Object.keys(rows[0]);
  const { nameKey, tableKey, seatKey } = classifyHeaders(headers);

  if (!nameKey || !tableKey) {
    return {
      guests: [],
      errors: [
        "Couldn't find both a guest-name column and a table column. " +
          "Expected something like Name/Table/Seat, or Nom/Table/Siège — " +
          "found columns: " +
          headers.join(", "),
      ],
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
/**
 * Tries the Python parsing service first (fuzzy header matching for
 * messy/misspelled/French column names). Falls back to the local
 * TypeScript parser if the service is unreachable, slow, or errors —
 * uploads should never hard-fail because a second service is down.
 */
export async function parseGuestCsvSmart(csvText: string): Promise<CsvResult> {
  const url = process.env.PARSER_SERVICE_URL;
  if (!url) return parseGuestCsv(csvText);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${url}/api/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: csvText }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return parseGuestCsv(csvText);

    const data = await res.json();
    if (!Array.isArray(data.guests)) return parseGuestCsv(csvText);

    return {
      guests: data.guests,
      errors: data.errors ?? [],
      skipped: data.skipped ?? 0,
    };
  } catch (err) {
    console.error("Parser service unavailable, falling back to local parser:", err);
    return parseGuestCsv(csvText);
  }
}