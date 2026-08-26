"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { saveOrganizerSession } from "@/lib/organizer-session";

export default function ActivatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (code.trim().length < 6) {
      setError("Enter your full event code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/organizer/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "We couldn't verify this event code.");
        return;
      }
      saveOrganizerSession({ eventId: data.eventId, eventName: data.eventName });
      router.push("/organizer/seats");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <p className="text-xs font-semibold uppercase tracking-tight2 text-muted">Event activation</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight2">Enter your event code</h1>
      <p className="mt-1.5 text-sm text-muted">
        The code was sent to you when your event was registered with the platform team.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="EVT-7K4P-92XM"
        className="touch mt-6 w-full rounded border border-line bg-white px-4 text-[15px] font-mono tracking-wide outline-none focus:border-ink"
      />
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <Button className="mt-6" fullWidth onClick={submit} disabled={loading}>
        {loading ? "Checking…" : "Continue"}
      </Button>
      <p className="mt-4 text-center text-xs text-muted">
        No event code yet?{" "}
        <a href="/admin/events/new" className="underline underline-offset-2">
          Create one in the admin dashboard
        </a>
        .
      </p>
    </div>
  );
}
