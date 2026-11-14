import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { wedding } from "@/config";
import { useDateReveal } from "@/context/DateReveal";
import { ceremonyStart } from "@/lib/calendar";
import { cn } from "@/utils/cn";
import { Reveal, SectionHeading } from "./ui";

function CountdownGrid({ target, locked }: { target: Date; locked: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (locked) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [locked]);

  const diff = Math.max(0, target.getTime() - now);

  if (!locked && diff === 0) {
    return (
      <p className="text-center font-script text-5xl text-gold-300 sm:text-6xl">
        Just married - thank you for celebrating with us!
      </p>
    );
  }

  const units = [
    { label: "Days", value: Math.floor(diff / 86_400_000) },
    { label: "Hours", value: Math.floor(diff / 3_600_000) % 24 },
    { label: "Minutes", value: Math.floor(diff / 60_000) % 60 },
    { label: "Seconds", value: Math.floor(diff / 1000) % 60 },
  ];

  return (
    <div
      className="mx-auto grid max-w-3xl grid-cols-4 gap-2 sm:gap-5"
      role={locked ? undefined : "timer"}
      aria-label={locked ? "Countdown locked until the date is revealed" : "Countdown to the wedding"}
    >
      {units.map((u) => (
        <div
          key={u.label}
          className="rounded-2xl bg-ivory/10 px-1 py-5 text-center ring-1 ring-ivory/25 backdrop-blur-md sm:rounded-3xl sm:py-8"
        >
          <div
            className={cn(
              "font-serif text-4xl font-medium tabular-nums sm:text-6xl",
              locked ? "text-gold-300/70" : "fade-in text-ivory",
            )}
          >
            {locked ? "··" : String(u.value).padStart(2, "0")}
          </div>
          <div className="mt-2 font-sans text-[9px] tracking-[0.3em] text-ivory/70 uppercase sm:text-[11px]">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CountdownSection() {
  const { revealed } = useDateReveal();

  return (
    <section className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
      <img
        src={wedding.images.countdown}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-ink-deep/70" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-b from-ink-deep/40 via-transparent to-ink-deep/60"
        aria-hidden="true"
      />

      <SectionHeading tone="light" eyebrow="Counting down" title="Until we say I do" />

      <Reveal delay={0.1} className="mt-12">
        <CountdownGrid target={ceremonyStart} locked={!revealed} />
      </Reveal>

      <Reveal delay={0.2} className="mt-10 text-center">
        {revealed ? (
          <p className="fade-in font-serif text-xl text-ivory/85 italic sm:text-2xl">
            {wedding.longDate} · {wedding.venue}
          </p>
        ) : (
          <a
            href="#date"
            className="inline-flex items-center gap-2 rounded-full bg-ivory/10 px-6 py-3 font-sans text-[11px] tracking-[0.22em] text-ivory uppercase ring-1 ring-ivory/40 backdrop-blur transition hover:bg-ivory/20"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Scratch the golden seals to start the clock
          </a>
        )}
      </Reveal>
    </section>
  );
}
