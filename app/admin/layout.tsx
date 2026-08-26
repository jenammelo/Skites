"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, UserCheck, Activity, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/ushers", label: "Usher Access", icon: UserCheck },
  { href: "/admin/activity", label: "Activity", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-paper md:flex">
      <aside className="hidden w-56 shrink-0 border-r border-line bg-white md:flex md:flex-col">
        <div className="px-5 py-6">
          <p className="text-[15px] font-semibold tracking-tight2">Platform Admin</p>
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
        <div className="border-t border-line px-3 py-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
          >
            <LogOut size={17} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3.5 md:hidden">
        <p className="text-[15px] font-semibold tracking-tight2">Platform Admin</p>
        <button onClick={logout} className="touch flex items-center gap-1 text-xs font-medium text-muted">
          <LogOut size={15} /> Log out
        </button>
      </header>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>

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
              <Icon size={19} strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
