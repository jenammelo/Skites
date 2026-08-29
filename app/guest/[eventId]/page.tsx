"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function GuestPortal({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ name: string; table: string; seat: string | null } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function find() {
    if (!name.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/guest/events/${eventId}/find?name=${encodeURIComponent(name.trim())}`);
      const data = await res.json();
      if (!data.found) {
        setNotFound(true);
        return;
      }
      setResult(data.guest);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper px-6 py-10">
      <div className="mx-auto w-full max-w-sm flex-1">
        {!result ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight2">Find your seat</h1>
            <p className="mt-1.5 text-sm text-muted">Enter your name to find your table.</p>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && find()}
              placeholder="Enter your name"
              className="touch mt-8 w-full rounded border border-line bg-white px-4 text-[16px] outline-none focus:border-ink"
              autoFocus
            />
            {notFound && (
              <p className="mt-2 text-sm text-red-700">
                We couldn&apos;t find that name. Check the spelling or ask an usher for help.
              </p>
            )}
            <Button className="mt-4" fullWidth onClick={find} disabled={loading}>
              {loading ? "Searching…" : "Find My Seat"}
            </Button>
          </>
        ) : (
          <div className="pt-6 text-center">
         <p className="text-lg text-ink">{t.welcome(result.name)}</p>
            <p className="mt-1 text-sm text-muted">Your table is:</p>
            <p className="tabular mt-6 text-[76px] font-bold leading-none tracking-tight2">
              {result.table.replace(/^table\s*/i, "")}
            </p>
            {result.seat && <p className="mt-3 text-base text-ink/80">Seat {result.seat}</p>}
            <button
              onClick={() => {
                setResult(null);
                setName("");
              }}
              className="mt-10 text-sm text-muted underline underline-offset-2"
            >
              Search another name
            </button>
          </div>
        )}
      </div>
      <p className="mx-auto text-center text-[11px] text-muted">No account or login needed.</p>
    </div>
  );
}
