import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({ variant = "primary", fullWidth, className, children, ...props }: Props) {
  return (
    <button
      className={cn(
        "touch inline-flex items-center justify-center gap-2 rounded px-4 text-[15px] font-medium transition-colors active:scale-[0.98]",
        variant === "primary" && "bg-ink text-paper hover:bg-ink/90 disabled:bg-ink/30",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-paper",
        variant === "ghost" && "text-ink hover:bg-paper",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
