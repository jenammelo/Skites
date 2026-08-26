import { cn } from "@/lib/utils";

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "good" | "warn"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-paper text-muted border border-line",
        tone === "good" && "bg-good/10 text-good",
        tone === "warn" && "bg-accent-soft text-accent"
      )}
    >
      {children}
    </span>
  );
}
