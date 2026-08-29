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
    <div className="min-h-dvh bg-paper">
      {/* HERO — violet mesh/wave depth */}
      <section className="relative overflow-hidden rounded-b-[2rem] pb-20 pt-5 md:rounded-b-[2.5rem] md:pb-28">
        <HeroBackground />

        {/* Nav */}
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
          <Logo />
          <div className="hidden items-center gap-3 sm:flex">
            <LangToggle lang={lang} setLang={setLang} />
            <Link href="/organizer/activate">
              <button className="touch rounded-2xl bg-white/15 px-3.5 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors hover:bg-white/25">
                {t.navLogin}
              </button>
            </Link>
          </div>
          {/* Mobile sidebar trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="touch flex items-center justify-center rounded-2xl bg-white/15 px-2.5 text-white ring-1 ring-white/40 backdrop-blur-sm sm:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} strokeWidth={2} />
          </button>
        </header>

        {/* Hero content */}
        <div className="relative mx-auto max-w-xl px-5 pb-2 pt-12 text-center md:max-w-2xl md:pt-16">
          <p className="text-xs font-bold uppercase tracking-tight2 text-[#E9D5FF]">{t.eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-tight2 text-white md:text-[48px]">
            {t.headline[0]}
            <br />
            {t.headline[1]}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-[16px] font-medium text-[#EAE0FB] md:max-w-md">{t.sub}</p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/organizer/activate" className="w-full sm:w-auto">
              <button className="touch w-full rounded-2xl bg-white px-6 text-[15px] font-semibold text-violet-800 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform active:scale-[0.98] sm:w-auto">
                <span className="inline-flex items-center gap-2">
                  {t.ctaPrimary} <ArrowRight size={15} />
                </span>
              </button>
            </Link>
            <Link href="/guest/demo" className="w-full sm:w-auto">
              <button className="touch w-full rounded-2xl bg-white/15 px-6 text-[15px] font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors hover:bg-white/25 sm:w-auto">
                {t.ctaSecondary}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
                   <div className="absolute inset-y-0 right-0 flex w-[78%] max-w-xs flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                className="touch flex items-center justify-center rounded-2xl bg-fuchsia-50 px-2.5 text-fuchsia-700 ring-1 ring-fuchsia-200"
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
                  className="touch rounded-xl px-3 py-2.5 text-[15px] font-semibold text-fuchsia-700 hover:bg-fuchsia-50"
                  onClick={() => setDrawerOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6">
              <LangToggle lang={lang} setLang={setLang} dark={false} />
            </div>
          </div>
        </div>
      )}

      {/* CORE PRINCIPLE — real ordered process */}
      <section className="border-b border-line bg-white px-5 py-8 md:px-10">
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-3">
              {t.principle.map((step, i) => (
                <div key={step} className="flex items-center">
                  <span className="tabular rounded-full border border-line bg-paper px-3 py-1.5 text-[13px] font-medium text-ink">
                    {step}
                  </span>
                  {i < t.principle.length - 1 && (
                    <ArrowRight size={13} strokeWidth={1.75} className="mx-1.5 text-muted" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-sm text-muted">{t.principleNote}</p>
          </div>
        </Reveal>
      </section>

      {/* STEP-BY-STEP EXPLAINER — alternating grid, visual on opposite side */}
      <section className="relative overflow-hidden px-5 py-16 md:px-10 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-violet-100/60 blur-[110px]" />

        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight2 md:text-3xl">{t.stepsHeading}</h2>
            <p className="mt-2 text-[15px] text-muted">{t.stepsSub}</p>
          </div>
        </Reveal>

        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* connecting line, desktop only */}
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-violet-200 via-violet-200 to-transparent md:block" />

          <div className="space-y-14 md:space-y-24">
            {t.steps.map((step, i) => {
              const Visual = STEP_VISUALS[i];
              const reversed = i % 2 === 1;
              return (
                <Reveal key={step.title} delay={i * 60}>
                  <div
                    className={cn(
                      "grid items-center gap-8 md:grid-cols-2 md:gap-14",
                      reversed && "md:[&>*:first-child]:order-2"
                    )}
                  >
                    <div className={cn("text-center md:text-left", reversed && "md:text-right")}>
                      <div
                        className={cn(
                          "mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-violet-700 text-sm font-semibold text-white md:mx-0",
                          reversed && "md:ml-auto md:mr-0"
                        )}
                      >
                        {i + 1}
                      </div>
                      <h3 className="mt-4 text-lg font-semibold tracking-tight2">{step.title}</h3>
                      <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink/70 md:mx-0">{step.body}</p>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-100/80 to-transparent blur-2xl" />
                      <Visual />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS — highlighted band for depth */}
      <section className="relative overflow-hidden border-y border-violet-100 bg-violet-50/60 px-5 py-14 md:px-10">
        <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-violet-200/40 blur-[100px]" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-fuchsia-200/30 blur-[100px]" />
        <Reveal>
          <h2 className="relative text-center text-lg font-semibold tracking-tight2">{t.statsHeading}</h2>
        </Reveal>
        <div className="relative mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {t.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="text-center">
                <p className="tabular text-2xl font-semibold tracking-tight2 text-violet-800 md:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="mx-auto max-w-4xl px-5 py-16 md:px-10">
        <Reveal>
          <h2 className="text-center text-lg font-semibold tracking-tight2">{t.rolesHeading}</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {t.roles.map((role, i) => (
            <Reveal key={role.title} delay={i * 100}>
              <div className="flex h-full flex-col rounded-lg border border-line bg-white p-5 transition-shadow duration-300 hover:shadow-card">
                <p className="text-xs font-semibold uppercase tracking-tight2 text-muted">{role.title}</p>
                <p className="tabular mt-1.5 text-[13px] font-medium text-violet-700">{role.tag}</p>
                <p className="mt-3 flex-1 text-sm text-ink/80">{role.body}</p>
                <Link href={role.href} className="mt-5">
                  <Button variant="secondary" fullWidth className="!text-sm">
                    {role.cta}
                  </Button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-line bg-white px-5 py-16 md:px-10">
        <Reveal>
          <h2 className="text-center text-lg font-semibold tracking-tight2">{t.testimonialsHeading}</h2>
        </Reveal>
        <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-3">
          {t.testimonials.map((tm, i) => (
            <Reveal key={tm.name} delay={i * 120}>
              <div className="h-full rounded-lg border border-line bg-paper p-5 transition-transform duration-300 hover:-translate-y-1">
                <Quote size={16} className="text-violet-300" strokeWidth={2} />
                <p className="mt-3 text-[14px] leading-relaxed text-ink/85">&ldquo;{tm.quote}&rdquo;</p>
                <p className="mt-4 text-[13px] font-medium text-ink">{tm.name}</p>
                <p className="text-[12px] text-muted">{tm.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="px-5 py-12 md:px-10">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-tight2 text-muted">
            {t.partnersHeading}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {t.partners.map((p) => (
              <span
                key={p}
                className="text-[15px] font-semibold tracking-tight2 text-ink/25 transition-colors duration-300 hover:text-violet-700/70"
              >
                {p}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* QR permanence note */}
      <section className="mx-auto max-w-xl px-5 pb-16 text-center md:max-w-2xl">
        <Reveal>
          <p className="text-sm text-muted">{t.qrNote}</p>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <div className="flex items-center gap-5">
            <Link href="/organizer/contact" className="text-xs text-muted hover:text-ink">
              {t.footerContact}
            </Link>
            <Link href="/admin/events" className="text-xs text-muted hover:text-ink">
              {t.footerPlatform}
            </Link>
            <LangToggle lang={lang} setLang={setLang} dark={false} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function LangToggle({
  lang,
  setLang,
  dark,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full p-0.5 transition-colors",
        dark === false ? "border border-line bg-paper" : "border border-white/40 bg-white/15 backdrop-blur-sm"
      )}
    >
      {(["EN", "FR"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "touch rounded-full px-2.5 text-xs font-semibold transition-colors",
            lang === l
              ? dark === false
                ? "bg-ink text-paper"
                : "bg-white text-violet-800"
              : dark === false
              ? "text-muted"
              : "text-white/80"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
