import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Ornament } from "./Decor";

/** Becomes true (once) when the element scrolls into view. */
export function useInView<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    // The observer reports once it is attached, even for off-screen elements.
    // If that never happens (some embedded/iframe browsers), reveal the content
    // anyway so nothing is ever left stuck at opacity 0.
    let reported = false;
    const fallback = window.setTimeout(() => {
      if (!reported) setInView(true);
    }, 1500);

    const io = new IntersectionObserver(
      (entries) => {
        reported = true;
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  return { ref, inView };
}

/** Fades & lifts its children in when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "is-visible", className)}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-sans text-[11px] font-medium tracking-[0.38em] text-gold-600 uppercase", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <Reveal className={cn("mx-auto max-w-2xl text-center", className)}>
      <Eyebrow className={light ? "text-gold-300" : undefined}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          "mt-3 font-serif text-4xl leading-tight font-medium sm:text-5xl",
          light ? "text-ivory" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mx-auto mt-4 max-w-xl font-sans text-[15px] leading-relaxed font-light",
            light ? "text-ivory/80" : "text-ink/70",
          )}
        >
          {subtitle}
        </p>
      )}
      <Ornament className="mt-6" />
    </Reveal>
  );
}
