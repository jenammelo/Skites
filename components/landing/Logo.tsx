import { cn } from "@/lib/utils";

export function Logo({ size = "base", dark = false }: { size?: "base" | "lg"; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        dark && "rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]",
        dark ? (size === "lg" ? "px-4 py-2" : "px-3 py-1.5") : ""
      )}
    >
      <span
        className={cn(
          "font-display font-bold tracking-tight text-ink",
          size === "lg" ? "text-2xl md:text-3xl" : "text-[17px]"
        )}
      >
        Skites
      </span>
      <span className={cn("rounded-full bg-brand", size === "lg" ? "h-2.5 w-2.5" : "h-1.5 w-1.5")} />
    </span>
  );
}