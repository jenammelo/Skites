import { Upload, Check, Search, QrCode as QrIcon } from "lucide-react";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[1.75rem] border border-line bg-white p-3 shadow-[0_20px_50px_-15px_rgba(20,22,26,0.18)]">
      <div className="rounded-[1.25rem] border border-line bg-paper p-4">{children}</div>
    </div>
  );
}

export function UploadVisual() {
  return (
    <Frame>
      <div className="flex flex-col items-center rounded-lg border border-dashed border-line bg-white px-4 py-8 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper">
          <Upload size={16} className="text-ink" strokeWidth={1.75} />
        </div>
        <p className="mt-3 text-xs font-medium text-ink">guests_wedding.csv</p>
        <p className="mt-1 text-[10px] text-muted">350 rows detected</p>
      </div>
    </Frame>
  );
}

export function OrganizeVisual() {
  const tables = [
    { name: "Table 01", guests: 8 },
    { name: "Table 02", guests: 6 },
    { name: "Table 03", guests: 10 },
  ];
  return (
    <Frame>
      <div className="space-y-2">
        {tables.map((t) => (
          <div key={t.name} className="flex items-center justify-between rounded border border-line bg-white px-3 py-2">
            <span className="text-xs font-medium text-ink">{t.name}</span>
            <span className="tabular text-[10px] text-muted">{t.guests} guests</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function QRVisual() {
  const cells = Array.from({ length: 9 * 9 }, (_, i) => {
    const seed = (i * 37 + 11) % 100;
    const isFinder = (i < 27 && i % 9 < 3) || (i % 9 > 5 && i < 27) || (i > 53 && i % 9 < 3);
    return isFinder ? true : seed > 55;
  });
  return (
    <Frame>
      <div className="flex flex-col items-center py-3">
        <div className="grid grid-cols-9 gap-[2px] rounded bg-white p-2">
          {cells.map((on, i) => (
            <div key={i} className="h-2 w-2" style={{ background: on ? "#14161A" : "transparent" }} />
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1 text-[10px] font-medium text-muted">
          <QrIcon size={11} /> One code, always up to date
        </p>
      </div>
    </Frame>
  );
}

export function GuestVisual() {
  return (
    <Frame>
      <div className="py-3 text-center">
        <p className="text-[11px] text-muted">Welcome, John.</p>
        <p className="tabular mt-2 text-4xl font-bold leading-none tracking-tight2 text-ink">14</p>
        <p className="mt-1 text-xs text-ink/70">Seat B4</p>
      </div>
    </Frame>
  );
}

export function UsherVisual() {
  return (
    <Frame>
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded border border-line bg-white px-3 py-2">
          <Search size={13} className="text-muted" />
          <span className="text-xs text-muted">Search guest</span>
        </div>
        <div className="flex items-center justify-between rounded border border-line bg-white px-3 py-2">
          <span className="text-xs text-ink">Amara Nkeng</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-good/10 px-2 py-0.5 text-[10px] font-medium text-good">
            <Check size={10} /> In
          </span>
        </div>
        <p className="tabular pt-1 text-center text-[10px] text-muted">184 / 350 checked in</p>
      </div>
    </Frame>
  );
}