"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Sparkles, Table, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/landing/Logo";
import { saveOrganizerSession } from "@/lib/organizer-session";
import { cn } from "@/lib/utils";

type Lang = "EN" | "FR";

const COPY = {
  EN: {
    eyebrow: "Event activation",
    heading: "Activate your event",
    sub: "Your activation code confirms your event was registered with the Skites team — you'll need it to upload your guest list and build your seating plan.",
    steps: [
      { icon: Check, text: "Confirms your event with our team" },
      { icon: Table, text: "Unlocks your CSV seating upload" },
      { icon: QrCode, text: "Generates your permanent guest QR code" },
    ],
    placeholder: "EVT-7K4P-92XM",
    error: "Enter your full event code.",
    apiError: "We couldn't verify this event code.",
    networkError: "Something went wrong. Check your connection and try again.",
    checking: "Checking…",
    continue: "Continue",
    orDivider: "Don't have a code yet?",
    getCode: "Get your event code",
    getCodeSub: "We'll chat with you on WhatsApp and send your code shortly after.",
    poweredBy: "Powered by",
  },
  FR: {
    eyebrow: "Activation d'événement",
    heading: "Activez votre événement",
    sub: "Votre code d'activation confirme que votre événement a été enregistré auprès de l'équipe Skites — il vous sera demandé pour importer votre liste d'invités et créer votre plan de placement.",
    steps: [
      { icon: Check, text: "Confirme votre événement auprès de notre équipe" },
      { icon: Table, text: "Débloque l'import CSV de vos invités" },
      { icon: QrCode, text: "Génère votre QR code permanent" },
    ],
    placeholder: "EVT-7K4P-92XM",
    error: "Entrez votre code d'événement complet.",
    apiError: "Nous n'avons pas pu vérifier ce code.",
    networkError: "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
    checking: "Vérification…",
    continue: "Continuer",
    orDivider: "Vous n'avez pas encore de code ?",
    getCode: "Obtenir votre code d'événement",
    getCodeSub: "Nous discuterons avec vous sur WhatsApp et vous enverrons votre code peu après.",
    poweredBy: "Propulsé par",
  },
} as const;

const WHATSAPP_NUMBER = "237651996886";
const WHATSAPP_MESSAGE: Record<Lang, string> = {
  EN: "Hello i want to register my event with skites ? Send me the event code so i can activate my seating plan",
  FR: "Bienvenue ! Souhaitez-vous créer un plan de placement d'événement avec Skites ? Nous enregistrerions votre événement et vous enverrions un code d'événement pour seulement 15 000 FCFA.",
};

export default function ActivatePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("EN");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const t = COPY[lang];

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  }

  async function submit() {
    if (code.trim().length < 6) {
      setError(t.error);
      triggerShake();
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
        setError(data.error ?? t.apiError);
        triggerShake();
        return;
      }
      saveOrganizerSession({ eventId: data.eventId, eventName: data.eventName });
      router.push("/organizer/seats");
    } catch {
      setError(t.networkError);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE[lang])}`;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-paper">
      {/* soft violet glow, kept subtle since this is a utility screen not the hero */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/40 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-fuchsia-100/50 blur-[100px]" />

      {/* language toggle */}
      <div className="relative flex justify-end px-6 pt-6">
        <div className="inline-flex rounded-full border border-line bg-white p-0.5">
          {(["EN", "FR"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "touch rounded-full px-3 text-xs font-semibold transition-colors",
                lang === l ? "bg-ink text-paper" : "text-muted"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto flex max-w-sm flex-col px-6 pb-10 pt-6">
        <p className="text-xs font-semibold uppercase tracking-tight2 text-violet-700">{t.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight2 text-ink">{t.heading}</h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{t.sub}</p>

        {/* why activation matters */}
        <div className="mt-6 space-y-2.5 rounded-lg border border-line bg-white p-4">
          {t.steps.map((step) => (
            <div key={step.text} className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50">
                <step.icon size={13} strokeWidth={2} className="text-violet-700" />
              </div>
              <p className="text-[13px] text-ink/80">{step.text}</p>
            </div>
          ))}
        </div>

        {/* code entry */}
        <div className={cn("mt-7 transition-transform", shake && "animate-shake")}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t.placeholder}
            className={cn(
              "touch w-full rounded-xl border bg-white px-4 text-[16px] font-mono tracking-[0.15em] outline-none transition-colors",
              error ? "border-red-300 focus:border-red-500" : "border-line focus:border-violet-500"
            )}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

        <Button className="mt-5 !bg-violet-700 hover:!bg-violet-800" fullWidth onClick={submit} disabled={loading}>
          {loading ? t.checking : t.continue} {!loading && <ArrowRight size={15} />}
        </Button>

        {/* get a code via whatsapp */}
        <div className="mt-8 border-t border-line pt-6 text-center">
          <p className="text-xs text-muted">{t.orDivider}</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="touch mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 text-[15px] font-semibold text-violet-700 transition-colors hover:bg-violet-100"
          >
            <MessageCircle size={16} /> {t.getCode}
          </a>
          <p className="mt-2 text-xs text-muted">{t.getCodeSub}</p>
        </div>

        {/* powered by */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Sparkles size={12} className="text-violet-400" />
            {t.poweredBy}
          </p>
          <Logo />
        </div>
      </div>
    </div>
  );
}