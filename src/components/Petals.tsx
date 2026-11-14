import { useMemo, type CSSProperties } from "react";
import { cn } from "@/utils/cn";

const PETAL_COLORS = ["#f1bd3c", "#ffe8b0", "#c94938"];

/** Marigold, jasmine and rose petals drifting down. Purely decorative. */
export function Petals({ className, count = 16 }: { className?: string; count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 61 + 7) % 100,
        delay: -((i * 1.9) % 16),
        duration: 12 + ((i * 37) % 9),
        size: 10 + ((i * 29) % 12),
        drift: (i % 2 ? 1 : -1) * (40 + ((i * 17) % 90)),
        spin: 360 + ((i * 53) % 360),
        opacity: 0.55 + ((i * 13) % 40) / 100,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
      })),
    [count],
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {petals.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="petal"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              "--petal-delay": `${p.delay}s`,
              "--petal-duration": `${p.duration}s`,
              "--petal-drift": `${p.drift}px`,
              "--petal-spin": `${p.spin}deg`,
              "--petal-opacity": `${p.opacity}`,
            } as CSSProperties
          }
        >
          <path d="M10 1 C15.5 4.5 17.5 10 10 19 C2.5 10 4.5 4.5 10 1 Z" fill={p.color} />
        </svg>
      ))}
    </div>
  );
}
