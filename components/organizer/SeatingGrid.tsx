"use client";

import { useState } from "react";
import { Plus, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type GridGuest = { id: string; name: string; table: string; seat: string | null };
type Row = { id?: string; name: string; table: string; seat: string; checkedIn?: boolean };

export function SeatingGrid({
  eventId,
  guests,
  onClose,
  onSaved,
}: {
  eventId: string;
  guests: GridGuest[];
  onClose: () => void;
  onSaved: (guests: GridGuest[]) => void;
}) {
  const [rows, setRows] = useState<Row[]>(
    guests.map((g) => ({ id: g.id, name: g.name, table: g.table, seat: g.seat ?? "" }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(index: number, field: "name" | "table" | "seat", value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { name: "", table: "", seat: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/guests/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: rows.map((r) => ({ id: r.id, name: r.name, table: r.table, seat: r.seat })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save your changes.");
        return;
      }
      onSaved(data.guests);
      onClose();
    } catch {
      setError("Something went wrong saving your changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3.5">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight2">Edit seating plan</h2>
          <p className="text-xs text-muted">Changes here don&apos;t affect your QR code or checked-in guests.</p>
        </div>
        <button onClick={onClose} className="touch flex items-center justify-center rounded px-2 text-muted">
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="border-b border-line bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_theme(colors.line)]">
            <tr>
              <th className="w-10 border-b border-line px-2 py-2 text-left text-xs font-medium text-muted">#</th>
              <th className="border-b border-line px-2 py-2 text-left text-xs font-medium text-muted">Name</th>
              <th className="border-b border-line px-2 py-2 text-left text-xs font-medium text-muted">Table</th>
              <th className="border-b border-line px-2 py-2 text-left text-xs font-medium text-muted">Seat</th>
              <th className="border-b border-line px-2 py-2 text-left text-xs font-medium text-muted">Status</th>
              <th className="w-10 border-b border-line px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? `new-${i}`} className="odd:bg-white even:bg-paper">
                <td className="tabular border-b border-line px-2 py-1.5 text-xs text-muted">{i + 1}</td>
                <GridCell value={row.name} onChange={(v) => update(i, "name", v)} placeholder="Guest name" />
                <GridCell value={row.table} onChange={(v) => update(i, "table", v)} placeholder="Table 01" />
                <GridCell value={row.seat} onChange={(v) => update(i, "seat", v)} placeholder="A1" />
                <td className="border-b border-line px-2 py-1.5">
                  {row.id ? (
                    guests.find((g) => g.id === row.id) && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Check size={11} className="text-good" /> saved
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-accent">new</span>
                  )}
                </td>
                <td className="border-b border-line px-2 py-1.5">
                  <button onClick={() => removeRow(i)} className="touch flex items-center justify-center text-muted hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addRow}
          className="touch mx-4 my-3 flex items-center gap-1.5 rounded border border-dashed border-line px-3 text-sm text-muted hover:border-ink hover:text-ink"
        >
          <Plus size={14} /> Add row
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-line bg-white px-4 py-3.5">
        <p className="tabular text-xs text-muted">{rows.length} rows</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function GridCell({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <td className="border-b border-line p-0">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-violet-50"
      />
    </td>
  );
}
