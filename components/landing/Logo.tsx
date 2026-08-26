import { cn } from "@/lib/utils";

export function Logo({ size = "base" }: { size?: "base" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]",
        size === "lg" ? "px-4 py-2" : "px-3 py-1.5"
      )}
    >
      <span
        className={cn(
          "font-semibold tracking-tight2 text-violet-700",
          size === "lg" ? "text-2xl md:text-3xl" : "text-[15px]"
        )}
      >
        Skites
      </span>
      <span className={cn("rounded-full bg-violet-500", size === "lg" ? "h-2.5 w-2.5" : "h-1.5 w-1.5")} />
    </span>
  );
}
