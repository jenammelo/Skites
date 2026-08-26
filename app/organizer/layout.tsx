"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QrCode, Armchair, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getOrganizerSession } from "@/lib/organizer-session";

const NAV = [
  { href: "/organizer/seats", label: "Seats", icon: Armchair },
  { href: "/organizer/qr", label: "QR Codes", icon: QrCode },
  { href: "/organizer/contact", label: "Contact Us", icon: MessageCircle },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useState<"EN" | "FR">("EN");
  const [eventName, setEventName] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === "/organizer/activate") return;
    const session = getOrganizerSession();
    if (!session) {
      router.replace("/organizer/activate");
      return;
    }
    setEventName(session.eventName);
  }, [pathname, router]);

  if (pathname === "/organizer/activate") return <>{children}</>;

  return (
    <div className="min-h-dvh bg-paper md:flex">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-white md:flex md:flex-col">
        <div className="px-5 py-6">
          <p className="text-[15px] font-semibold tracking-tight2">{eventName ?? "Loading…"}</p>
          <p className="mt-0.5 text-xs text-muted">Organizer session</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium",
                  active ? "bg-ink text-paper" : "text-ink/80 hover:bg-paper"
                )}
              >
                <Icon size={17} strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line px-5 py-4">
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3.5 md:hidden">
        <p className="text-[15px] font-semibold tracking-tight2">{eventName ?? "Loading…"}</p>
        <LangToggle lang={lang} setLang={setLang} compact />
      </header>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-white/95 backdrop-blur md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "touch flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
                active ? "text-ink" : "text-muted"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function LangToggle({
  lang,
  setLang,
  compact,
}: {
  lang: "EN" | "FR";
  setLang: (l: "EN" | "FR") => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("inline-flex rounded-full border border-line bg-paper p-0.5", compact && "text-xs")}>
      {(["EN", "FR"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            lang === l ? "bg-ink text-paper" : "text-muted"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
