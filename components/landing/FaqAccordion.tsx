"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-8 max-w-2xl divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="touch flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[15px] font-medium text-ink">{item.q}</span>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                  open ? "bg-brand text-white" : "bg-paper text-ink"
                )}
              >
                <Plus size={14} className={cn("transition-transform duration-200", open && "rotate-45")} />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink/70">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}