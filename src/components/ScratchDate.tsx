import { useCallback, useRef, useState } from "react";
import { CalendarPlus, ChevronDown, Download, RotateCcw, Sparkles } from "lucide-react";
import { wedding } from "@/config";
import { useDateReveal } from "@/context/DateReveal";
import { ScratchArea } from "./scratch/ScratchArea";
import { ScratchCard } from "./scratch/ScratchCard";
import { ScratchHint, TempleSealFace } from "./Decor";
import { sound } from "@/lib/sound";
import { burstAt, celebrate } from "@/lib/celebrate";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";

const parts = wedding.dateParts;

export function ScratchDate() {
  const { setRevealed: unlockSite } = useDateReveal();
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [forceReveal, setForceReveal] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const revealedRef = useRef(new Set<string>());
  const complete = revealed.length === parts.length;

  const handleStart = useCallback(() => {
    sound.unlock();
    setStarted(true);
  }, []);

  const handleProgress = useCallback((id: string, p: number) => {
    setProgress((prev) => (prev[id] === p ? prev : { ...prev, [id]: p }));
  }, []);

  const handleReveal = useCallback(
    (id: string, rect: DOMRect) => {
      const set = revealedRef.current;
      if (set.has(id)) return;
      set.add(id);
      const count = set.size;
      setRevealed(Array.from(set));

      burstAt(rect);
      sound.chime(count * 2 - 2);
      try {
        navigator.vibrate?.(14);
      } catch {
        /* not supported */
      }

      if (count === parts.length) {
        window.setTimeout(() => {
          celebrate();
          sound.fanfare();
          unlockSite(true); // countdown, details & footer now show the date
        }, 420);
      }
    },
    [unlockSite],
  );

  const revealAll = () => {
    sound.unlock();
    setStarted(true);
    setForceReveal(true);
  };

  const scratchAgain = () => {
    revealedRef.current = new Set();
    setRevealed([]);
    setProgress({});
    setForceReveal(false);
    setStarted(false);
    setRound((r) => r + 1);
  };

  return (
    <div className="mt-8 sm:mt-10">
      {/* Instructions — fixed height so the hearts never shift while scratching */}
      <div className="flex min-h-[3.5rem] flex-col items-center justify-start">
        <p className="flex items-center justify-center gap-2 text-center font-serif text-lg text-ink italic sm:text-xl">
          <Sparkles className="hidden h-4 w-4 shrink-0 text-gold-500 sm:block" aria-hidden="true" />
          Scratch the golden seals to reveal our date
          <Sparkles className="hidden h-4 w-4 shrink-0 text-gold-500 sm:block" aria-hidden="true" />
        </p>
        <p className="mt-1 font-sans text-[10px] tracking-[0.2em] text-sage-600 uppercase sm:text-[11px]">
          One swipe can cross all three
        </p>
      </div>

      <ScratchArea
        key={round}
        className="relative mx-auto mt-5 grid w-full max-w-[28rem] grid-cols-3 gap-3 sm:gap-7"
        onScratchStart={handleStart}
        onScratchFrame={(d) => sound.scratch(d)}
        onScratchEnd={() => {
          // Touch only grants audio permission on pointerup — unlock here too.
          sound.unlock();
          sound.stop();
        }}
      >
        {parts.map((part, i) => {
          const isRevealed = revealed.includes(part.id);
          const p = isRevealed ? 1 : (progress[part.id] ?? 0);
          return (
            <div key={part.id} className="relative flex flex-col items-center">
              <ScratchCard
                id={part.id}
                seed={i + 1}
                shape="circle"
                threshold={0.5}
                brushRatio={0.26}
                forceReveal={forceReveal}
                revealDelay={i * 380}
                showSheen={!started}
                sheenDelay={i * 0.45}
                className="w-full"
                onProgress={handleProgress}
                onReveal={handleReveal}
              >
                <TempleSealFace value={part.value} italic={part.italic} />
              </ScratchCard>

              <span className="mt-2.5 font-sans text-[10px] font-medium tracking-[0.32em] text-sage-700 uppercase sm:text-[11px]">
                {part.label}
              </span>
              {/* progress: transform-only so it never triggers layout */}
              <span className="mt-1.5 block h-[2px] w-10 overflow-hidden rounded-full bg-gold-200 sm:w-14">
                <span
                  className="block h-full origin-left rounded-full bg-gold-500 transition-transform duration-200"
                  style={{ transform: `scaleX(${Math.min(1, p / 0.5)})` }}
                />
              </span>

              {i === 1 && !started && !complete && (
                <ScratchHint className="top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          );
        })}
      </ScratchArea>

      {/* Below the hearts: fallback before, the full date after */}
      <div className="mt-7 min-h-[2.5rem]">
        {!complete ? (
          <button
            type="button"
            onClick={revealAll}
            disabled={forceReveal}
            className="font-sans text-xs tracking-[0.14em] text-sage-600 underline decoration-gold-400/60 underline-offset-4 transition hover:text-ink disabled:opacity-50"
          >
            Can't scratch? Reveal the date
          </button>
        ) : (
          <div className="fade-in">
            <p className="font-serif text-2xl text-ink sm:text-3xl">{wedding.longDate}</p>
            <p className="mt-2 font-sans text-[11px] tracking-[0.3em] text-sage-700 uppercase">
              {wedding.venue} · {wedding.city}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={googleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-sans text-sm text-ivory shadow-[0_10px_24px_-12px_rgba(47,62,52,0.8)] transition hover:-translate-y-0.5 hover:bg-ink-deep"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Google Calendar
              </a>
              <button
                type="button"
                onClick={downloadIcs}
                className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 font-sans text-sm text-ink ring-1 ring-gold-400/70 transition hover:-translate-y-0.5 hover:bg-gold-200/40"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Apple / Outlook
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5">
              <a
                href="#details"
                className="inline-flex items-center gap-1 font-sans text-xs tracking-[0.16em] text-sage-700 uppercase transition hover:text-ink"
              >
                The details <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <span className="h-3 w-px bg-gold-300" aria-hidden="true" />
              <button
                type="button"
                onClick={scratchAgain}
                className="inline-flex items-center gap-1.5 font-sans text-xs tracking-[0.16em] text-sage-700 uppercase transition hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Scratch again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {complete ? `Date revealed: ${wedding.longDate}, at ${wedding.venue}, ${wedding.city}.` : ""}
      </p>
    </div>
  );
}
