"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QrCode, Armchair, MessageCircle, Instagram, Facebook, Linkedin, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getOrganizerSession } from "@/lib/organizer-session";

const NAV = [
  { href: "/organizer/seats", label: "Seats", icon: Armchair },
  { href: "/organizer/qr", label: "QR Codes", icon: QrCode },
    { href: "/organizer/ushers", label: "Ushers", icon: UserCheck },
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
                  active ? "bg-fuchsia-700 text-white" : "text-fuchsia-800 hover:bg-fuchsia-50"
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

      <main className="flex-1 pb-20 md:pb-0">
        {children}
        <Footer />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-white/95 backdrop-blur md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "touch flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
                active ? "text-fuchsia-700" : "text-muted"
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

function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-white px-5 py-8 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-tight2 text-fuchsia-800">Skites</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-muted">Calmer guest entry, from seating plan to check-in.</p>
          <p className="mt-5 text-xs text-muted">© {new Date().getFullYear()} Skites. All rights reserved.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-tight2 text-muted">Quick links</p>
            <div className="mt-2 flex gap-4 text-xs font-medium text-ink/80">
              <Link href="/organizer/seats" className="hover:text-fuchsia-700">Seats</Link>
              <Link href="/organizer/qr" className="hover:text-fuchsia-700">QR code</Link>
              <Link href="/organizer/contact" className="hover:text-fuchsia-700">Contact</Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-tight2 text-muted">Follow us</p>
            <div className="mt-2 flex gap-2">
              <SocialLink href="https://www.instagram.com/" label="Instagram" icon={Instagram} />
              <SocialLink href="https://www.facebook.com/" label="Facebook" icon={Facebook} />
              <SocialLink href="https://www.linkedin.com/" label="LinkedIn" icon={Linkedin} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Instagram;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fuchsia-700 transition-colors hover:border-fuchsia-200 hover:bg-fuchsia-50"
    >
      <Icon size={16} strokeWidth={1.75} />
    </a>
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
