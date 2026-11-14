import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { useScratchRegistry, type ScratchTarget } from "./ScratchArea";
import { createCoverageGrid, paintFoil, type CoverageGrid } from "./paintFoil";
import { shapeMaskUrl, type ScratchShape } from "./shapes";

/** Resolution of the coverage grid used to measure progress (GRID × GRID cells). */
const GRID = 40;
/** Share of the text ("focus") region that, once cleared, reveals the card. */
const FOCUS_THRESHOLD = 0.82;

export interface ScratchCardProps {
  id: string;
  /** The hidden content revealed underneath the foil. */
  children: ReactNode;
  shape?: ScratchShape;
  /** Varies the foil texture between cards. */
  seed?: number;
  /** Fraction (0–1) of the foil that must be cleared to auto-reveal. */
  threshold?: number;
  /** Brush diameter relative to the card's smaller side. */
  brushRatio?: number;
  /** Reveal programmatically (e.g. a "reveal" button). */
  forceReveal?: boolean;
  /** Delay (ms) before a forced reveal — lets several cards cascade. */
  revealDelay?: number;
  /** Show the idle light sweep across untouched foil. */
  showSheen?: boolean;
  sheenDelay?: number;
  className?: string;
  onReveal?: (id: string, rect: DOMRect) => void;
  onProgress?: (id: string, progress: number) => void;
}

type EngineState = {
  ctx: CanvasRenderingContext2D | null;
  w: number;
  h: number;
  dpr: number;
  paintedKey: string;
  rect: DOMRect | null;
  /** Normalised segments [ax, ay, bx, by, …] — replayed after a resize. */
  segments: number[];
  grid: CoverageGrid | null;
  cleared: number;
  focusCleared: number;
  dirty: boolean;
  revealed: boolean;
  lastReported: number;
};

function prepareEraser(ctx: CanvasRenderingContext2D, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
}

function eraseSegment(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  brush: number,
) {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx * dx + dy * dy < 0.25) {
    // A tap (or a pointer that barely moved): stamp a round dot.
    ctx.beginPath();
    ctx.arc(ax, ay, brush / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = brush;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
}

export function ScratchCard({
  id,
  children,
  shape = "heart",
  seed = 1,
  threshold = 0.5,
  brushRatio = 0.2,
  forceReveal = false,
  revealDelay = 0,
  showSheen = true,
  sheenDelay = 0,
  className,
  onReveal,
  onProgress,
}: ScratchCardProps) {
  const registry = useScratchRegistry();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Latest props in a ref: the drawing engine never needs to re-initialise
  // (and wipe the foil) just because a parent re-rendered with new callbacks.
  const props = useRef({ id, threshold, brushRatio, onReveal, onProgress });
  useEffect(() => {
    props.current = { id, threshold, brushRatio, onReveal, onProgress };
  });

  const engine = useRef<EngineState>({
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
    paintedKey: "",
    rect: null,
    segments: [],
    grid: null,
    cleared: 0,
    focusCleared: 0,
    dirty: false,
    revealed: false,
    lastReported: -1,
  });

  const brushSize = useCallback(() => {
    const s = engine.current;
    return Math.max(16, Math.min(s.w, s.h) * props.current.brushRatio);
  }, []);

  /** Size the backing store to the element (× devicePixelRatio) and paint the foil. */
  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const s = engine.current;
    if (!canvas || !wrap || s.revealed) return;

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w < 2 || h < 2) return;

    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
    const key = `${w}x${h}@${dpr}:${shape}:${seed}`;
    if (key === s.paintedKey) return; // nothing changed — never repaint mid-scratch

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    s.ctx = ctx;
    s.w = w;
    s.h = h;
    s.dpr = dpr;
    s.paintedKey = key;
    if (!s.grid) s.grid = createCoverageGrid(shape, GRID);

    paintFoil(ctx, w, h, dpr, shape, seed);

    // Replay earlier scratches so a resize/rotation never "heals" the foil.
    if (s.segments.length) {
      prepareEraser(ctx, dpr);
      const brush = brushSize();
      const seg = s.segments;
      for (let i = 0; i < seg.length; i += 4) {
        eraseSegment(ctx, seg[i] * w, seg[i + 1] * h, seg[i + 2] * w, seg[i + 3] * h, brush);
      }
    }
    setReady(true);
  }, [shape, seed, brushSize]);

  const reveal = useCallback(() => {
    const s = engine.current;
    if (s.revealed) return;
    s.revealed = true;
    setRevealed(true);
    const rect = wrapRef.current?.getBoundingClientRect() ?? new DOMRect();
    props.current.onProgress?.(props.current.id, 1);
    props.current.onReveal?.(props.current.id, rect);
  }, []);

  /** Mark coverage-grid cells within the brush radius of a segment. */
  const markCoverage = useCallback((ax: number, ay: number, bx: number, by: number, r: number) => {
    const s = engine.current;
    const grid = s.grid;
    if (!grid) return false;
    const { cells, focus } = grid;
    const cw = s.w / GRID;
    const ch = s.h / GRID;
    const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - r) / cw));
    const i1 = Math.min(GRID - 1, Math.floor((Math.max(ax, bx) + r) / cw));
    const j0 = Math.max(0, Math.floor((Math.min(ay, by) - r) / ch));
    const j1 = Math.min(GRID - 1, Math.floor((Math.max(ay, by) + r) / ch));
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const r2 = r * r;
    let touched = false;

    for (let j = j0; j <= j1; j++) {
      const cy = (j + 0.5) * ch;
      for (let i = i0; i <= i1; i++) {
        const k = j * GRID + i;
        const cell = cells[k];
        if (cell === 0) continue;
        const cx = (i + 0.5) * cw;
        let t = len2 > 0 ? ((cx - ax) * dx + (cy - ay) * dy) / len2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const px = ax + t * dx - cx;
        const py = ay + t * dy - cy;
        if (px * px + py * py <= r2) {
          touched = true;
          if (cell === 1) {
            cells[k] = 2;
            s.cleared++;
            if (focus[k]) s.focusCleared++;
          }
        }
      }
    }
    return touched;
  }, []);

  // Register with the surrounding <ScratchArea>.
  useEffect(() => {
    if (!registry) return;

    const target: ScratchTarget = {
      isActive: () => !engine.current.revealed && engine.current.ctx !== null,

      beginFrame: () => {
        const s = engine.current;
        const canvas = canvasRef.current;
        s.rect = canvas ? canvas.getBoundingClientRect() : null;
        if (s.ctx) prepareEraser(s.ctx, s.dpr);
      },

      scratch: (a, b) => {
        const s = engine.current;
        const { rect, ctx } = s;
        if (!rect || !ctx || s.revealed || rect.width === 0 || rect.height === 0) return false;

        // Viewport → local CSS px. The ratio also corrects for CSS scale transforms.
        const kx = s.w / rect.width;
        const ky = s.h / rect.height;
        const ax = (a.x - rect.left) * kx;
        const ay = (a.y - rect.top) * ky;
        const bx = (b.x - rect.left) * kx;
        const by = (b.y - rect.top) * ky;

        const brush = brushSize();
        const r = brush / 2;
        if (
          Math.max(ax, bx) < -r ||
          Math.min(ax, bx) > s.w + r ||
          Math.max(ay, by) < -r ||
          Math.min(ay, by) > s.h + r
        ) {
          return false; // segment doesn't touch this card
        }

        eraseSegment(ctx, ax, ay, bx, by, brush);
        s.segments.push(ax / s.w, ay / s.h, bx / s.w, by / s.h);
        s.dirty = true;
        return markCoverage(ax, ay, bx, by, r);
      },

      endFrame: () => {
        const s = engine.current;
        if (!s.dirty || s.revealed || !s.grid) return;
        s.dirty = false;
        const progress = s.grid.total ? s.cleared / s.grid.total : 1;
        const focus = s.grid.focusTotal ? s.focusCleared / s.grid.focusTotal : 0;

        if (Math.abs(progress - s.lastReported) >= 0.01) {
          s.lastReported = progress;
          props.current.onProgress?.(props.current.id, progress);
        }
        if (progress >= props.current.threshold || focus >= FOCUS_THRESHOLD) reveal();
      },
    };

    return registry.register(target);
  }, [registry, brushSize, markCoverage, reveal]);

  // Paint before the first browser paint (no flash of the hidden date),
  // and keep the canvas crisp when the element or pixel ratio changes.
  useLayoutEffect(() => {
    setup();
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => setup());
      ro.observe(wrap);
    }
    // If the browser drops the canvas context (low memory, backgrounded tab),
    // repaint the foil and replay the scratches instead of exposing the date.
    const onRestored = () => {
      engine.current.paintedKey = "";
      setup();
    };
    window.addEventListener("resize", setup);
    canvas.addEventListener("contextrestored", onRestored);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", setup);
      canvas.removeEventListener("contextrestored", onRestored);
    };
  }, [setup]);

  // Programmatic reveal.
  useEffect(() => {
    if (!forceReveal || engine.current.revealed) return;
    const t = window.setTimeout(reveal, revealDelay);
    return () => window.clearTimeout(t);
  }, [forceReveal, revealDelay, reveal]);

  const mask = shapeMaskUrl(shape);

  return (
    <div ref={wrapRef} className={cn("relative aspect-square", className)}>
      {/* Hidden content — invisible until the foil is painted over it */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0",
          revealed && "reveal-pop",
        )}
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {/* The foil */}
      <canvas
        ref={canvasRef}
        data-scratch={revealed ? "done" : "active"}
        aria-hidden="true"
        className={cn(
          "scratch-canvas absolute inset-0 block h-full w-full transition-[opacity,scale,filter] duration-700 ease-out",
          revealed && "scale-110 opacity-0 blur-[2px]",
        )}
      />

      {/* Idle light sweep (never intercepts the pointer) */}
      {showSheen && ready && !revealed && (
        <div
          aria-hidden="true"
          className="foil-sheen pointer-events-none absolute inset-0"
          style={
            {
              WebkitMaskImage: mask,
              maskImage: mask,
              "--sheen-delay": `${sheenDelay}s`,
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}
