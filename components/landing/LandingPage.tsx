"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Quote, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";
import { HeroBackground } from "./HeroBackground";
import { UploadVisual, OrganizeVisual, QRVisual, GuestVisual, UsherVisual } from "./StepVisuals";
import { COPY, Lang } from "./copy";
import { cn } from "@/lib/utils";

const STEP_VISUALS = [UploadVisual, OrganizeVisual, QRVisual, GuestVisual, UsherVisual];

export function LandingPage() {
  const [lang, setLang] = useState<Lang>("EN");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const t = COPY[lang];

  return (
    <div className="min-h-dvh bg-paper text-ink">
      {/* NAV — white, minimal, editorial */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
          <Logo />
          <div className="hidden items-center gap-6 sm:flex">
            <LangToggle lang={lang} setLang={setLang} />
            <Link href="/organizer/activate" className="text-sm font-medium text-ink/70 hover:text-ink">
              {t.navLogin}
            </Link>
            <Link href="/organizer/activate">
              <button className="touch rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
                {t.ctaPrimary}
              </button>
            </Link>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="touch flex items-center justify-center rounded-full border border-line px-2.5 text-ink sm:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[78%] max-w-xs flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                className="touch flex items-center justify-center rounded-full bg-paper px-2.5 text-ink"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {[
                { href: "/organizer/activate", label: t.roles[0].title },
                { href: "/guest/demo", label: t.roles[1].title },
                { href: "/usher/demo-token", label: t.roles[2].title },
                { href: "/organizer/contact", label: t.footerContact },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="touch rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-paper"
                  onClick={() => setDrawerOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link href="/organizer/activate" className="mt-4">
              <button className="touch w-full rounded-full bg-brand px-5 text-sm font-semibold text-white">
                {t.ctaPrimary}
              </button>
            </Link>
            <div className="mt-auto pt-6">
              <LangToggle lang={lang} setLang={setLang} />
            </div>
          </div>
        </div>
      )}

      {/* HERO — photo-led, editorial headline */}
      <section className="relative isolate flex min-h-[85vh] items-end overflow-hidden pb-16 pt-24 sm:min-h-[90vh] md:pb-24">
        <HeroBackground />
        <div className="relative mx-auto w-full max-w-xl px-5 md:max-w-2xl md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">{t.eyebrow}</p>
          <h1 className="font-display mt-3 text-[36px] font-bold leading-[1.08] text-white md:text-[56px]">
            {t.headline[0]}
            <br />
            {t.headline[1]}
          </h1>
          <p className="mt-4 max-w-sm text-[15px] text-white/85 md:max-w-md md:text-base">{t.sub}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/organizer/activate">
              <button className="touch w-full rounded-full bg-brand px-6 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark sm:w-auto">
                <span className="inline-flex items-center gap-2">
                  {t.ctaPrimary} <ArrowRight size={15} />
                </span>
              </button>
            </Link>
            <Link href="/guest/demo">
              <button className="touch w-full rounded-full border border-white/40 bg-white/10 px-6 text-[15px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:w-auto">
                {t.ctaSecondary}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CORE PRINCIPLE strip */}
      <section className="border-b border-line bg-white px-5 py-7 md:px-10">
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-3">
              {t.principle.map((step, i) => (
                <div key={step} className="flex items-center">
                  <span className="tabular rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-ink">
                    {step}
                  </span>
                  {i < t.principle.length - 1 && (
                    <ArrowRight size={13} strokeWidth={1.75} className="mx-1.5 text-muted" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-muted">{t.principleNote}</p>
          </div>
        </Reveal>
      </section>

      {/* STEPS — horizontal scroll on mobile with next-card peek, grid on desktop */}
      <section className="px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-[26px] font-bold md:text-4xl">{t.stepsHeading}</h2>
            <p className="mt-2 text-[15px] text-muted">{t.stepsSub}</p>
          </div>
        </Reveal>

        <div className="mx-auto mt-10 max-w-6xl">
          <div
            className={cn(
              "flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:pb-0",
              "snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {t.steps.map((step, i) => {
              const Visual = STEP_VISUALS[i];
              return (
                <Reveal key={step.title} delay={i * 60} className="w-[78%] shrink-0 snap-start md:w-auto">
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight2">{step.title}</h3>
                    <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink/65">{step.body}</p>
                    <div className="mt-4">
                      <Visual />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS — dark band */}
      <section className="bg-ink px-5 py-12 text-white md:px-10">
        <Reveal>
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
            {t.statsHeading}
          </h2>
        </Reveal>
        <div className="mx-auto mt-7 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {t.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="text-center">
                <p className="font-display tabular text-2xl font-bold text-brand md:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-white/70">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROLES — editorial card grid */}
      <section className="mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <h2 className="font-display text-center text-[26px] font-bold md:text-4xl">{t.rolesHeading}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {t.roles.map((role, i) => (
            <Reveal key={role.title} delay={i * 100}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-shadow duration-300 hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{role.title}</p>
                <p className="tabular mt-1.5 text-[13px] font-medium text-brand">{role.tag}</p>
                <p className="mt-3 flex-1 text-sm text-ink/75">{role.body}</p>
                <Link href={role.href} className="mt-5">
                  <button className="touch w-full rounded-full border border-ink px-4 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white">
                    {role.cta}
                  </button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — horizontal scroll, editorial quote cards */}
      <section className="border-y border-line bg-white px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <h2 className="font-display text-center text-[26px] font-bold md:text-4xl">{t.testimonialsHeading}</h2>
        </Reveal>
        <div className="mx-auto mt-8 max-w-5xl">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {t.testimonials.map((tm, i) => (
              <Reveal key={tm.name} delay={i * 120} className="w-[82%] shrink-0 snap-start sm:w-auto">
                <div className="h-full rounded-2xl border border-line bg-paper p-6 transition-transform duration-300 hover:-translate-y-1">
                  <Quote size={18} className="text-brand" strokeWidth={2} />
                  <p className="font-display mt-3 text-[16px] leading-snug text-ink">&ldquo;{tm.quote}&rdquo;</p>
                  <p className="mt-4 text-[13px] font-semibold text-brand">{tm.name}</p>
                  <p className="text-[12px] text-muted">{tm.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="px-5 py-12 md:px-10">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-[0.1em] text-muted">{t.partnersHeading}</p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {t.partners.map((p) => (
              <span
                key={p}
                className="font-display text-[16px] font-semibold text-ink/25 transition-colors duration-300 hover:text-brand"
              >
                {p}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA — bold pink band */}
      <section className="bg-brand px-5 py-16 text-center text-white md:px-10 md:py-20">
        <Reveal>
          <h2 className="font-display mx-auto max-w-xl text-[28px] font-bold leading-tight md:text-4xl">
            {t.headline[0]} {t.headline[1]}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-white/90">{t.qrNote}</p>
          <Link href="/organizer/activate">
            <button className="touch mt-7 rounded-full bg-white px-7 text-[15px] font-semibold text-brand transition-transform active:scale-[0.98]">
              {t.ctaPrimary}
            </button>
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-white px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <div className="flex items-center gap-5">
            <Link href="/organizer/contact" className="text-xs text-muted hover:text-ink">
              {t.footerContact}
            </Link>
            <Link href="/admin/events" className="text-xs text-muted hover:text-ink">
              {t.footerPlatform}
            </Link>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-full border border-line p-0.5">
      {(["EN", "FR"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "touch rounded-full px-2.5 text-xs font-semibold transition-colors",
            lang === l ? "bg-ink text-white" : "text-muted"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}