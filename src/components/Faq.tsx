import { useState } from "react";
import { Plus } from "lucide-react";
import { wedding } from "@/config";
import { cn } from "@/utils/cn";
import { Reveal, SectionHeading } from "./ui";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative px-4 pt-8 pb-24 sm:px-6 sm:pb-32">
      <SectionHeading eyebrow="Good to know" title="Questions & answers" />

      <Reveal className="mx-auto mt-12 max-w-3xl">
        <div className="rounded-[30px] bg-ivory px-6 ring-1 ring-gold-300/50 shadow-[0_30px_60px_-44px_rgba(80,60,30,0.6)] sm:px-10">
          {wedding.faqs.map((f, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            return (
              <div key={f.q} className={cn(i > 0 && "border-t border-gold-300/50")}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-serif text-xl font-medium text-ink sm:text-2xl">{f.q}</span>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 transition duration-300",
                        isOpen ? "rotate-45 bg-ink text-ivory ring-ink" : "text-gold-600 ring-gold-300",
                      )}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-400 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pr-12 pb-6 font-sans text-[15px] leading-relaxed font-light text-ink/75">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
