import { cn } from "@/lib/utils";

export function Logo({ size = "base", onDark = false }: { size?: "base" | "lg"; onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          size === "lg" ? "text-2xl md:text-3xl" : "text-[17px]",
          onDark ? "text-white" : "text-ink"
        )}
      >
        Skites
      </span>
      <span className={cn("rounded-full bg-brand", size === "lg" ? "h-2.5 w-2.5" : "h-1.5 w-1.5")} />
    </span>
  );
}