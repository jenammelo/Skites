"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, Table as TableIcon, QrCode, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getOrganizerSession } from "@/lib/organizer-session";
import { SeatingGrid, GridGuest } from "./SeatingGrid";

type Guest = { id: string; name: string; table: string; seat: string | null };
type Step = "loading" | "empty" | "upload" | "progress" | "success" | "results";

function groupByTable(guests: Guest[]) {
  const map = new Map<string, Guest[]>();
  for (const g of guests) {
    if (!map.has(g.table)) map.set(g.table, []);
    map.get(g.table)!.push(g);
  }
  return Array.from(map.entries());
}

export function SeatsFlow() {
  const router = useRouter();
  const [eventId, setEventId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [progress, setProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{ imported: number; tables: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [gridOpen, setGridOpen] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const pendingFile = useRef<string | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const session = getOrganizerSession();
    if (!session) {
      router.replace("/organizer/activate");
      return;
    }
    setEventId(session.eventId);
    loadGuests(session.eventId);
  }, [router]);

  async function loadGuests(id: string) {
    const res = await fetch(`/api/organizer/events/${id}/guests`);
    const data = await res.json();
    const list: Guest[] = data.guests ?? [];
    setGuests(list);
    setStep(list.length > 0 ? "results" : "empty");
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      pendingFile.current = String(reader.result ?? "");
      runImport();
    };
    reader.readAsText(file);
  }

  function runImport() {
    setUploadError(null);
    setStep("progress");
    setProgress(0);
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.max(3, Math.round((90 - p) * 0.15)) : p));
    }, 160);

    (async () => {
      if (!eventId || !pendingFile.current) return;
      try {
        const res = await fetch(`/api/organizer/events/${eventId}/guests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv: pendingFile.current }),
        });
        const data = await res.json();
        if (progressTimer.current) clearInterval(progressTimer.current);

        if (!res.ok) {
          setProgress(0);
          setUploadError(data.error ?? "We couldn't read that file.");
          setStep("upload");
          return;
        }

        setProgress(100);
        setImportSummary({ imported: data.imported, tables: data.tables });
        setTimeout(() => setStep("success"), 350);
      } catch {
        if (progressTimer.current) clearInterval(progressTimer.current);
        setUploadError("Something went wrong uploading your file.");
        setStep("upload");
      }
    })();
  }

  async function viewResults() {
    if (!eventId) return;
    await loadGuests(eventId);
    setStep("results");
  }

  if (step === "loading") {
    return <div className="px-4 py-16 text-center text-sm text-muted">Loading your event…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 md:px-8">
      {step === "empty" && <EmptyState onStart={() => setStep("upload")} />}

      {step === "upload" && (
        <UploadStep error={uploadError} onFile={readFile} onBack={() => setStep(guests.length ? "results" : "empty")} />
      )}

      {step === "progress" && (
        <div className="pt-10">
          <h1 className="text-xl font-semibold tracking-tight2">Importing your seating plan</h1>
          <div className="mt-6 space-y-3">
            <ProgressBar value={progress} />
            <p className="tabular text-sm text-muted">{progress}%</p>
          </div>
          <p className="mt-6 text-sm text-ink/80">
            {progress < 40 ? "Reading guests…" : progress < 80 ? "Organizing tables…" : "Saving seating information…"}
          </p>
        </div>
      )}

      {step === "success" && importSummary && (
        <div className="flex flex-col items-center pt-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-good/10">
            <Check className="text-good" size={26} strokeWidth={2.5} />
          </div>
          <p className="mt-5 text-lg font-semibold tracking-tight2">Done</p>
          <p className="mt-1.5 max-w-xs text-sm text-muted">Your seating plan has been successfully imported.</p>
          <div className="mt-6 flex gap-6 text-sm">
            <div>
              <p className="tabular text-2xl font-semibold">{importSummary.imported}</p>
              <p className="text-muted">guests imported</p>
            </div>
            <div>
              <p className="tabular text-2xl font-semibold">{importSummary.tables}</p>
              <p className="text-muted">tables detected</p>
            </div>
          </div>
          <Button className="mt-8" onClick={viewResults}>
            View seating plan
          </Button>
        </div>
      )}

      {step === "results" && (
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight2">Your seating plan</h1>
              <p className="mt-1 text-sm text-muted">Review and update your guest placements.</p>
            </div>
            <Button variant="secondary" className="!px-3 !text-sm shrink-0" onClick={() => setGridOpen(true)}>
              <TableIcon size={15} /> Edit
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {groupByTable(guests).map(([table, tableGuests]) => (
              <Card key={table} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-tight2 text-muted">{table}</p>
                  <a href="/organizer/qr" className="touch inline-flex items-center gap-1 rounded px-2 text-xs font-medium text-accent">
                    <QrCode size={14} /> QR
                  </a>
                </div>
                <ul className="mt-2 divide-y divide-line">
                  {tableGuests.map((g) => (
                    <li key={g.id} className="flex items-center justify-between py-2.5">
                      <p className="text-[15px] text-ink">{g.name}</p>
                      <p className="tabular text-xs text-muted">{g.seat ? `Seat ${g.seat}` : "No seat set"}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="my-8 border-t border-line pt-6">
            <Button variant="secondary" fullWidth onClick={() => setReplacing(true)}>
              <Upload size={16} /> Upload a CSV document
            </Button>
          </div>
        </div>
      )}

      {gridOpen && eventId && (
        <SeatingGrid
          eventId={eventId}
          guests={guests as GridGuest[]}
          onClose={() => setGridOpen(false)}
          onSaved={(updated) => setGuests(updated as Guest[])}
        />
      )}

      {replacing && (
        <ConfirmSheet
          title="Replace your current seating plan?"
          body="Matching guests keep their check-in status — this only adds, updates, or removes rows to match the new file."
          onCancel={() => setReplacing(false)}
          onConfirm={() => {
            setReplacing(false);
            setStep("upload");
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper border border-line">
        <Upload size={22} strokeWidth={1.75} className="text-muted" />
      </div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight2">Upload your guest seating plan</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Upload your CSV file containing your guests and their assigned tables.
      </p>
      <Button className="mt-7" onClick={onStart}>
        Upload CSV
      </Button>
      <p className="mt-3 text-xs text-muted">Supported format: .CSV — headers like Name, Table, Seat</p>
    </div>
  );
}

function UploadStep({
  error,
  onFile,
  onBack,
}: {
  error: string | null;
  onFile: (file: File) => void;
  onBack: () => void;
}) {
  return (
    <div className="pt-10">
      <button onClick={onBack} className="text-sm text-muted">
        ← Back
      </button>
      <h1 className="mt-4 text-xl font-semibold tracking-tight2">Upload your seating plan</h1>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <label className="mt-6 flex touch cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white px-6 py-14 text-center">
        <Upload size={22} strokeWidth={1.75} className="text-muted" />
        <p className="mt-4 text-sm text-ink">Drag &amp; drop your file here</p>
        <p className="mt-1 text-xs text-muted">or</p>
        <span className="mt-3 rounded border border-line bg-paper px-4 py-2 text-sm font-medium">Choose CSV</span>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
    </div>
  );
}

function ConfirmSheet({
  title,
  body,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/30 md:items-center" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-t-lg border border-line bg-white p-5 md:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold tracking-tight2">{title}</h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button fullWidth onClick={onConfirm}>
            Continue <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
