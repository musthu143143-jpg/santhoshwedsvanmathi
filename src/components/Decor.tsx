import { useId, useMemo } from "react";
import { cn } from "@/utils/cn";
import { SHAPE_PATHS } from "./scratch/shapes";

/** A hand-drawn-looking olive/eucalyptus branch, generated along a curve. */
export function Branch({ className, leaves = 11 }: { className?: string; leaves?: number }) {
  const items = useMemo(() => {
    const out: Array<{ x: number; y: number; angle: number; size: number; o: number }> = [];
    const P0 = [14, 186];
    const C = [46, 70];
    const P2 = [188, 16];
    for (let i = 1; i <= leaves; i++) {
      const t = i / (leaves + 1);
      const x = (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * C[0] + t ** 2 * P2[0];
      const y = (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * C[1] + t ** 2 * P2[1];
      const dx = 2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P2[0] - C[0]);
      const dy = 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P2[1] - C[1]);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const size = 22 - i * 1.1;
      out.push({ x, y, angle: angle - 48, size, o: 0.5 + ((i * 37) % 30) / 100 });
      out.push({ x, y, angle: angle + 48, size: size * 0.92, o: 0.4 + ((i * 53) % 30) / 100 });
    }
    return out;
  }, [leaves]);

  return (
    <svg viewBox="0 0 200 200" className={cn("pointer-events-none", className)} aria-hidden="true">
      <path d="M14 186 Q46 70 188 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      {items.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.angle})`}>
          <path
            d={`M0 0 Q${l.size * 0.5} ${-l.size * 0.42} ${l.size} 0 Q${l.size * 0.5} ${l.size * 0.42} 0 0 Z`}
            fill="currentColor"
            fillOpacity={l.o * 0.55}
            stroke="currentColor"
            strokeOpacity={0.7}
            strokeWidth="0.7"
          />
          <path d={`M1 0 L${l.size * 0.82} 0`} stroke="currentColor" strokeOpacity={0.55} strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

/** Thin rule with a tiny gold lotus. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-gold-500", className)} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/80 sm:w-20" />
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M12 21c-4.5-1.9-7.5-5.1-8.2-9.6 2.8-.3 5.2.4 6.8 2.3C9.5 9.8 9.8 6.7 12 3c2.2 3.7 2.5 6.8 1.4 10.7 1.6-1.9 4-2.6 6.8-2.3C19.5 15.9 16.5 19.1 12 21Z" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/80 sm:w-20" />
    </div>
  );
}

/** A simple rice-flour kolam line motif for temple-inspired surfaces. */
export function Kolam({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 110" className={cn("pointer-events-none", className)} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.35" opacity="0.8">
        <path d="M160 14c26 0 47 21 47 47s-21 47-47 47-47-21-47-47 21-47 47-47Z" />
        <path d="M160 28c18 0 33 15 33 33s-15 33-33 33-33-15-33-33 15-33 33-33Z" />
        <path d="M74 61c18-31 47-31 64 0-17 31-46 31-64 0ZM246 61c-18-31-47-31-64 0 17 31 46 31 64 0Z" />
        <path d="M20 61h77M223 61h77M160 0v33M160 77v33" />
        <circle cx="74" cy="61" r="4" fill="currentColor" />
        <circle cx="246" cy="61" r="4" fill="currentColor" />
        <circle cx="160" cy="14" r="4" fill="currentColor" />
        <circle cx="160" cy="108" r="4" fill="currentColor" />
      </g>
    </svg>
  );
}

/** The ivory heart that sits under the foil and carries the hidden value. */
export function HeartFace({ value, italic = false }: { value: string; italic?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const size = Math.min(36, (118 / Math.max(2, value.length)) * (italic ? 1.1 : 1));
  const d = SHAPE_PATHS.heart;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible drop-shadow-[0_8px_14px_rgba(120,90,40,0.2)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`face-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#f5ead6" />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#face-${uid})`} stroke="#c9a553" strokeWidth="1.6" />
      <path
        d={d}
        fill="none"
        stroke="#e6d3a8"
        strokeWidth="0.7"
        transform="translate(50 46) scale(0.86) translate(-50 -46)"
      />
      <text
        x="50"
        y="45"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontStyle={italic ? "italic" : "normal"}
        fontWeight={600}
        fontSize={size}
        fill="#2f3e34"
      >
        {value}
      </text>
    </svg>
  );
}

/** The circular temple-seal face used beneath the scratch-off foil. */
export function TempleSealFace({ value, italic = false }: { value: string; italic?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const size = Math.min(30, (106 / Math.max(2, value.length)) * (italic ? 1.05 : 1));
  const d = SHAPE_PATHS.circle;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible drop-shadow-[0_8px_14px_rgba(86,24,10,0.2)]"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`seal-${uid}`} cx="35%" cy="25%" r="80%">
          <stop offset="0" stopColor="#fffdf5" />
          <stop offset="1" stopColor="#f4dfb0" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#seal-${uid})`} stroke="#b76f0c" strokeWidth="1.8" />
      <circle cx="50" cy="50" r="39" fill="none" stroke="#d99b1d" strokeWidth="0.7" strokeDasharray="1.6 2.1" />
      <path
        d="M50 73c-11-5-18-12-20-22 7-1 13 1 17 6-2-8-1-14 3-20 4 6 5 12 3 20 4-5 10-7 17-6-2 10-9 17-20 22Z"
        fill="#d99b1d"
        fillOpacity="0.13"
        stroke="#b76f0c"
        strokeOpacity="0.4"
        strokeWidth="0.65"
      />
      <text
        x="50"
        y="49"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Marcellus', 'Cormorant Garamond', Georgia, serif"
        fontStyle={italic ? "italic" : "normal"}
        fontWeight={600}
        fontSize={size}
        fill="#4b1115"
      >
        {value}
      </text>
    </svg>
  );
}

/** Animated hand that shows where to scratch. Purely decorative. */
export function ScratchHint({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute z-10", className)} aria-hidden="true">
      <div className="scratch-hint">
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 drop-shadow-[0_4px_6px_rgba(60,40,10,0.35)] sm:h-12 sm:w-12"
          fill="#fffdf8"
          stroke="#2f3e34"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 14a8 8 0 0 1-8 8" />
          <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
          <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
          <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </div>
    </div>
  );
}
