"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  QrCode,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  PlusCircle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getOrganizerEvents, setActiveOrganizerEvent, OrganizerEvent } from "@/lib/organizer-session";
import { SeatingGrid, GridGuest } from "./SeatingGrid";

type Guest = { id: string; name: string; table: string; seat: string | null };

type EventSummary = {
  guestCount: number;
  tableCount: number;
  fileName: string | null;
  replacesUsed: number;
  guests: Guest[];
};

const REPLACE_LIMIT = 2;
const ACCEPTED = ".csv,.xlsx,.xls";

export function SeatsFlow() {
  const router = useRouter();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [summaries, setSummaries] = useState<Record<string, EventSummary>>({});
  const [loadingList, setLoadingList] = useState(true);

  const [uploadingEventId, setUploadingEventId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [cardErrors, setCardErrors] = useState<Record<string, string | null>>({});
  const [limitReachedFor, setLimitReachedFor] = useState<string | null>(null);
  const [gridEventId, setGridEventId] = useState<string | null>(null);
  const [confirmReplaceFor, setConfirmReplaceFor] = useState<string | null>(null);

  const pendingTarget = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const list = getOrganizerEvents();
    if (list.length === 0) {
      router.replace("/organizer/activate");
      return;
    }
    setEvents(list);
    loadAllSummaries(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function fetchSummary(eventId: string): Promise<EventSummary> {
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/guests`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const guests: Guest[] = data.guests ?? [];
      return {
        guestCount: guests.length,
        tableCount: new Set(guests.map((g) => g.table)).size,
        fileName: data.fileName ?? null,
        replacesUsed: data.replacesUsed ?? 0,
        guests,
      };
    } catch {
      setCardErrors((prev) => ({ ...prev, [eventId]: "Couldn't load this event. Check your connection." }));
      return { guestCount: 0, tableCount: 0, fileName: null, replacesUsed: 0, guests: [] };
    }
  }

  async function loadAllSummaries(list: OrganizerEvent[]) {
    setLoadingList(true);
    const entries = await Promise.all(
      list.map(async (e) => [e.eventId, await fetchSummary(e.eventId)] as const)
    );
    setSummaries(Object.fromEntries(entries));
    setLoadingList(false);
  }

  async function refreshSummary(eventId: string) {
    const summary = await fetchSummary(eventId);
    setSummaries((prev) => ({ ...prev, [eventId]: summary }));
  }

  function openFilePicker(eventId: string) {
    setCardErrors((prev) => ({ ...prev, [eventId]: null }));
    setLimitReachedFor(null);
    pendingTarget.current = eventId;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const targetEventId = pendingTarget.current;
    e.target.value = "";
    if (!file || !targetEventId) return;

    try {
      const isExcel = /\.xlsx?$/i.test(file.name);
      const csvText = isExcel ? await excelToCsv(file) : await file.text();
      runImport(targetEventId, csvText, file.name);
    } catch (err) {
      console.error(err);
      setCardErrors((prev) => ({
        ...prev,
        [targetEventId]: "We couldn't read that file. Make sure it's a CSV, .xlsx, or .xls export.",
      }));
    }
  }

  async function excelToCsv(file: File): Promise<string> {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) throw new Error("No sheet found in file.");
    return XLSX.utils.sheet_to_csv(firstSheet);
  }

  function runImport(eventId: string, csvText: string, name: string) {
    setCardErrors((prev) => ({ ...prev, [eventId]: null }));
    setLimitReachedFor(null);
    setUploadingEventId(eventId);
    setProgress(0);
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.max(3, Math.round((90 - p) * 0.15)) : p));
    }, 160);

    (async () => {
      try {
        const res = await fetch(`/api/organizer/events/${eventId}/guests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv: csvText, fileName: name }),
        });
        const data = await res.json();
        if (progressTimer.current) clearInterval(progressTimer.current);

        if (!res.ok) {
          setProgress(0);
          if (data.limitReached) setLimitReachedFor(eventId);
          setCardErrors((prev) => ({ ...prev, [eventId]: data.error ?? "We couldn't process that file." }));
          setUploadingEventId(null);
          return;
        }

        setProgress(100);
        setTimeout(async () => {
          await refreshSummary(eventId);
          setUploadingEventId(null);
        }, 350);
      } catch (err) {
        console.error(err);
        if (progressTimer.current) clearInterval(progressTimer.current);
        setCardErrors((prev) => ({
          ...prev,
          [eventId]: "Something went wrong uploading your file. Check your connection and try again.",
        }));
        setUploadingEventId(null);
      }
    })();
  }

  function openQr(event: OrganizerEvent) {
    setActiveOrganizerEvent(event);
    router.push("/organizer/qr");
  }

  function openUshers(event: OrganizerEvent) {
    setActiveOrganizerEvent(event);
    router.push("/organizer/ushers");
  }

  if (loadingList) {
    return <div className="px-4 py-16 text-center text-sm text-muted">Loading your events…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 md:px-8">
      <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleFileChange} />

      <h1 className="text-xl font-semibold tracking-tight2">Your events</h1>
      <p className="mt-1 text-sm text-muted">Every event you've activated, and its seating plan.</p>

      <div className="mt-6 space-y-5">
        {events.map((event) => {
          const summary = summaries[event.eventId];
          const error = cardErrors[event.eventId];
          const isUploading = uploadingEventId === event.eventId;
          const hasFile = (summary?.guestCount ?? 0) > 0;
          const replacesLeft = REPLACE_LIMIT - (summary?.replacesUsed ?? 0);

          return (
            <div key={event.eventId}>
              <p className="mb-2 text-sm font-semibold text-ink">{event.eventName}</p>

              {isUploading ? (
                <Card className="p-4">
                  <p className="text-sm font-medium text-ink">Importing your seating plan…</p>
                  <div className="mt-3 space-y-2">
                    <ProgressBar value={progress} />
                    <p className="tabular text-xs text-muted">{progress}%</p>
                  </div>
                </Card>
              ) : !hasFile ? (
                <Card className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper border border-line">
                    <Upload size={18} strokeWidth={1.75} className="text-muted" />
                  </div>
                  <p className="text-sm text-muted">No seating file uploaded yet.</p>
                  {error && (
                    <p className="flex items-center gap-1.5 text-sm text-red-700">
                      <AlertTriangle size={14} /> {error}
                    </p>
                  )}
                  <Button onClick={() => openFilePicker(event.eventId)}>Upload file</Button>
                </Card>
              ) : (
                <>
                  {error && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <Card className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                      <FileSpreadsheet size={18} className="text-violet-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{summary?.fileName ?? "Seating plan"}</p>
                      <p className="tabular text-xs text-muted">
                        {summary?.guestCount} guests · {summary?.tableCount} tables
                      </p>
                    </div>
                    <button
                      onClick={() => setGridEventId(event.eventId)}
                      className="touch shrink-0 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-paper"
                    >
                      View file
                    </button>
                  </Card>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    <button
                      onClick={() => openQr(event)}
                      className="flex items-center gap-2 text-sm font-medium text-accent"
                    >
                      <QrCode size={15} /> View event QR code
                    </button>
                    <button
                      onClick={() => openUshers(event)}
                      className="flex items-center gap-2 text-sm font-medium text-accent"
                    >
                      <UserCheck size={15} /> View usher link
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="tabular mb-2 text-xs text-muted">
                      {replacesLeft > 0
                        ? `${replacesLeft} free replacement${replacesLeft === 1 ? "" : "s"} remaining`
                        : "Both free replacements used"}
                    </p>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() =>
                        replacesLeft > 0 ? setConfirmReplaceFor(event.eventId) : setLimitReachedFor(event.eventId)
                      }
                    >
                      <RefreshCw size={16} /> Replace seating file
                    </Button>
                    {limitReachedFor === event.eventId && (
                      <p className="mt-2 text-sm text-red-700">
                        Both replacements are used. Message the Skites team on WhatsApp for help with a corrected file.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center border-t border-line pt-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper border border-line">
          <PlusCircle size={18} strokeWidth={1.75} className="text-muted" />
        </div>
        <p className="mt-3 text-sm text-ink">Setting up a different event?</p>
        <p className="mt-1 max-w-xs text-xs text-muted">
          Enter its event code and it'll be added here alongside your other events.
        </p>
        <Button className="mt-4" onClick={() => router.push("/organizer/activate")}>
          Upload file
        </Button>
      </div>

      {gridEventId && summaries[gridEventId] && (
        <SeatingGrid
          eventId={gridEventId}
          guests={summaries[gridEventId].guests as GridGuest[]}
          onClose={() => setGridEventId(null)}
          onSaved={(updated) =>
            setSummaries((prev) => ({
              ...prev,
              [gridEventId]: {
                ...prev[gridEventId],
                guests: updated,
                guestCount: updated.length,
                tableCount: new Set(updated.map((g) => g.table)).size,
              },
            }))
          }
        />
      )}

      {confirmReplaceFor && (
        <ConfirmSheet
          title="Replace your seating file?"
          body="This uses one of your remaining replacements for this event. Guests already checked in keep their status — this only updates the seating data."
          onCancel={() => setConfirmReplaceFor(null)}
          onConfirm={() => {
            const target = confirmReplaceFor;
            setConfirmReplaceFor(null);
            openFilePicker(target);
          }}
        />
      )}
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