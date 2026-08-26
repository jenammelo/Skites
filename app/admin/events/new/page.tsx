"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Check, Copy } from "lucide-react";

const FIELDS = [
  { key: "name", label: "Event name", placeholder: "Sarah & David Wedding" },
  { key: "organizerName", label: "Organizer name", placeholder: "Sarah Doe" },
  { key: "whatsapp", label: "WhatsApp number", placeholder: "+237 6XX XXX XXX", optional: true },
  { key: "email", label: "Email", placeholder: "sarah@example.com", optional: true },
  { key: "eventDate", label: "Event date", placeholder: "24 Oct 2026", optional: true },
];

export default function NewEventPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't create the event.");
        return;
      }
      setCode(data.event.activationCode);
    } finally {
      setLoading(false);
    }
  }

  if (code) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-good/10">
          <Check className="text-good" size={26} strokeWidth={2.5} />
        </div>
        <p className="mt-5 text-lg font-semibold tracking-tight2">Event created</p>
        <p className="mt-2 text-sm text-muted">Give this activation code to the organizer.</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
          }}
          className="tabular mt-6 flex items-center gap-2 rounded border border-line bg-white px-5 py-3 text-base font-mono tracking-wide"
        >
          {code} {copied ? <Check size={15} className="text-good" /> : <Copy size={15} className="text-muted" />}
        </button>
        <a href="/admin/events" className="mt-6 text-sm text-muted underline underline-offset-2">
          Back to events
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 md:px-8">
      <h1 className="text-xl font-semibold tracking-tight2">Create Event</h1>
      <p className="mt-1 text-sm text-muted">
        An activation code is generated automatically once the event is created.
      </p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-muted">{f.label}</label>
            <input
              required={!f.optional}
              placeholder={f.placeholder}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="touch mt-1 w-full rounded border border-line bg-white px-3 text-[15px] outline-none focus:border-ink"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" fullWidth className="mt-2" disabled={loading}>
          {loading ? "Creating…" : "Create Event"}
        </Button>
      </form>
    </div>
  );
}
