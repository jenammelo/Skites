"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Search, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

type UsherGuest = { id: string; name: string; table: string; seat: string | null; checkedIn: boolean };

export default function UsherPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [eventName, setEventName] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [total, setTotal] = useState(0);
  const [checkedIn, setCheckedIn] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UsherGuest[]>([]);
  const [selected, setSelected] = useState<UsherGuest | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    fetch(`/api/usher/${token}/summary`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setInvalid(true);
          return;
        }
        setEventName(d.eventName);
        setTotal(d.total);
        setCheckedIn(d.checkedIn);
      });
  }, [token]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      const res = await fetch(`/api/usher/${token}/guests?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.guests ?? []);
    }, 200);
    return () => clearTimeout(id);
  }, [query, token]);

  const remaining = useMemo(() => total - checkedIn, [total, checkedIn]);
  const pct = total > 0 ? (checkedIn / total) * 100 : 0;

  async function checkIn(g: UsherGuest) {
    const res = await fetch(`/api/usher/${token}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: g.id }),
    });
    const data = await res.json();
    if (res.ok) {
      setCheckedIn(data.checkedIn);
      setTotal(data.total);
      setSelected({ ...g, checkedIn: true });
      setApproved(true);
    }
  }

  if (invalid) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">This usher link is invalid or has expired. Ask your organizer for a new one.</p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="flex min-h-dvh flex-col bg-paper px-5 py-6">
        <button
          onClick={() => {
            setSelected(null);
            setApproved(false);
          }}
          className="touch flex w-fit items-center gap-1 text-sm text-muted"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mx-auto mt-10 w-full max-w-sm flex-1 text-center">
          {!approved ? (
            <>
              <p className="text-2xl font-semibold tracking-tight2">{selected.name}</p>
              <p className="tabular mt-2 text-base text-muted">
                {selected.table}
                {selected.seat ? ` · Seat ${selected.seat}` : ""}
              </p>
              <Button className="mt-10" fullWidth onClick={() => checkIn(selected)}>
                Verify Guest
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-good/10">
                <Check className="text-good" size={26} strokeWidth={2.5} />
              </div>
              <p className="mt-5 text-lg font-semibold tracking-tight2 text-good">Guest approved</p>
              <p className="mt-4 text-base text-ink">{selected.name}</p>
              <p className="tabular mt-1 text-sm text-muted">
                {selected.table}
                {selected.seat ? ` · Seat ${selected.seat}` : ""}
              </p>
              <Button
                variant="secondary"
                className="mt-10"
                fullWidth
                onClick={() => {
                  setSelected(null);
                  setApproved(false);
                  setQuery("");
                }}
              >
                Search next guest
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper px-5 py-6">
      <div className="mx-auto max-w-sm">
        {eventName && <p className="text-xs font-semibold uppercase tracking-tight2 text-muted">{eventName}</p>}
        <h1 className="mt-1 text-xl font-semibold tracking-tight2">Guest Entry</h1>

        <p className="tabular mt-5 text-2xl font-semibold">{checkedIn} guests entered</p>
        <p className="tabular mt-0.5 text-sm text-muted">{remaining} remaining</p>
        <ProgressBar value={pct} className="mt-3" />
        <p className="tabular mt-1.5 text-xs text-muted">{pct.toFixed(1)}%</p>

        <div className="mt-7">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guest"
              className="touch w-full rounded border border-line bg-white pl-10 pr-4 text-[16px] outline-none focus:border-ink"
              autoFocus
            />
          </div>

          {query && (
            <ul className="mt-3 divide-y divide-line rounded border border-line bg-white">
              {results.length === 0 && <li className="px-4 py-4 text-sm text-muted">No guest matches that name.</li>}
              {results.map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => setSelected(g)}
                    className="touch flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <p className="text-[15px] text-ink">{g.name}</p>
                      <p className="tabular text-xs text-muted">
                        {g.table}
                        {g.seat ? ` · Seat ${g.seat}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        g.checkedIn ? "bg-good/10 text-good" : "bg-paper text-muted border border-line"
                      )}
                    >
                      {g.checkedIn ? "Checked in" : "Not checked in"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
