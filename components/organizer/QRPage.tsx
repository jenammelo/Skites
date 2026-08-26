"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QR_COLORS } from "@/lib/types";
import { getOrganizerSession } from "@/lib/organizer-session";
import { cn } from "@/lib/utils";

export function QRPage() {
  const router = useRouter();
  const [color, setColor] = useState<(typeof QR_COLORS)[number]>(QR_COLORS[0]);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [guestUrl, setGuestUrl] = useState<string | null>(null);

  useEffect(() => {
    const session = getOrganizerSession();
    if (!session) {
      router.replace("/organizer/activate");
      return;
    }
    const url = `${window.location.origin}/guest/${session.eventId}`;
    setGuestUrl(url);
  }, [router]);

  useEffect(() => {
    if (!guestUrl) return;
    QRCode.toDataURL(guestUrl, { color: { dark: color.hex, light: "#00000000" }, margin: 1, width: 320 }).then(setDataUrl);
  }, [guestUrl, color]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "event-qr.png";
    a.click();
  }

  async function share() {
    if (!guestUrl) return;
    if (navigator.share) {
      await navigator.share({ title: "Find your seat", url: guestUrl });
    } else {
      await navigator.clipboard.writeText(guestUrl);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 md:px-8">
      <h1 className="text-xl font-semibold tracking-tight2">Your Event QR Code</h1>
      <p className="mt-1 text-sm text-muted">Guests can scan this QR code to find their assigned table.</p>

      <Card className="mt-6 flex flex-col items-center p-8">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Event QR code" width={176} height={176} className="h-44 w-44" />
        ) : (
          <div className="h-44 w-44 animate-pulse rounded bg-line" />
        )}
        <p className="mt-5 text-sm font-medium text-ink">Scan to find your seat</p>
        <p className="mt-1 text-xs text-muted">Same code works for the whole event, always up to date.</p>
      </Card>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-tight2 text-muted">QR Color</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QR_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c)}
              className={cn(
                "touch inline-flex items-center gap-2 rounded-full border px-3 text-sm",
                color.name === c.name ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink"
              )}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: c.hex }} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" fullWidth onClick={download} disabled={!dataUrl}>
          <Download size={16} /> Download PNG
        </Button>
        <Button fullWidth onClick={share} disabled={!guestUrl}>
          <Share2 size={16} /> Share QR
        </Button>
      </div>
    </div>
  );
}
