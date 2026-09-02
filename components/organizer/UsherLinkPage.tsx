"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Share2, Check, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getOrganizerSession } from "@/lib/organizer-session";

export function UsherLinkPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState<string | null>(null);
  const [usherUrl, setUsherUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const session = getOrganizerSession();
    if (!session) {
      router.replace("/organizer/activate");
      return;
    }

    fetch(`/api/organizer/events/${session.eventId}/usher-link`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setEventName(data.eventName);
        setUsherUrl(`${window.location.origin}/usher/${data.usherToken}`);
      })
      .catch(() => setError("Couldn't load the usher link. Check your connection and try again."));
  }, [router]);

  function copyLink() {
    if (!usherUrl) return;
    navigator.clipboard.writeText(usherUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    if (!usherUrl) return;
    if (navigator.share) {
      await navigator.share({ title: "Skites — Guest Entry", text: `Usher check-in link for ${eventName}`, url: usherUrl });
    } else {
      copyLink();
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 md:px-8">
      <h1 className="text-xl font-semibold tracking-tight2">Usher Link</h1>
      <p className="mt-1 text-sm text-muted">
        Share this with your ushers so they can check guests in at the door.
      </p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {!error && (
        <Card className="mt-6 flex flex-col items-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
            <UserCheck size={22} className="text-violet-700" strokeWidth={1.75} />
          </div>
          <p className="mt-4 text-sm font-medium text-ink">{eventName ?? "Loading…"}</p>
          <p className="mt-1 break-all text-xs text-muted">{usherUrl ?? "Fetching link…"}</p>

          <div className="mt-6 flex w-full gap-3">
            <Button variant="secondary" fullWidth onClick={copyLink} disabled={!usherUrl}>
              {copied ? <Check size={16} className="text-good" /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button fullWidth onClick={shareLink} disabled={!usherUrl}>
              <Share2 size={16} /> Share
            </Button>
          </div>
        </Card>
      )}

      <p className="mt-6 text-xs text-muted">
        Anyone with this link can check guests in for this event — only send it to people you trust to work
        the door. It stops working automatically once the event's 48-hour window ends.
      </p>
    </div>
  );
}