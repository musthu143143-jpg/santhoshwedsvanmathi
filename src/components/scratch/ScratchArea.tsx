import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

export type ClientPoint = { x: number; y: number };

/** What every scratchable card exposes to the area that drives it. */
export interface ScratchTarget {
  /** Whether this target still accepts scratches. */
  isActive(): boolean;
  /** Once per animation frame, before drawing: refresh geometry. */
  beginFrame(): void;
  /** Erase along a segment given in viewport (client) coordinates. Returns true if it touched foil. */
  scratch(a: ClientPoint, b: ClientPoint): boolean;
  /** Once per animation frame, after drawing: evaluate progress. */
  endFrame(): void;
}

interface Registry {
  register(target: ScratchTarget): () => void;
}

const ScratchContext = createContext<Registry | null>(null);

export function useScratchRegistry() {
  return useContext(ScratchContext);
}

type PointerTrack = { last: ClientPoint; queue: ClientPoint[] };

export interface ScratchAreaProps {
  children: ReactNode;
  className?: string;
  /** A gesture started that can scratch something. */
  onScratchStart?: () => void;
  /** Every frame while scratching foil: distance (CSS px) scratched this frame. */
  onScratchFrame?: (distance: number) => void;
  /** The last active pointer was lifted. */
  onScratchEnd?: () => void;
}

/**
 * Owns all pointer input for a group of <ScratchCard>s.
 *
 * Why a shared area instead of per-card listeners?
 *  - One continuous swipe can scratch across several cards (like real foil).
 *  - Pointer capture keeps the stroke alive even when the finger/mouse leaves a card.
 *  - Points are queued (including coalesced events) and drawn once per
 *    animation frame, with the card's rect re-measured every frame — so strokes
 *    stay glued to the pointer even if the layout shifts, the page scrolls,
 *    or a parent is CSS-transformed.
 */
export function ScratchArea({
  children,
  className,
  onScratchStart,
  onScratchFrame,
  onScratchEnd,
}: ScratchAreaProps) {
  const targets = useRef(new Set<ScratchTarget>());
  const pointers = useRef(new Map<number, PointerTrack>());
  const frame = useRef<number | null>(null);
  const callbacks = useRef({ onScratchStart, onScratchFrame, onScratchEnd });

  useEffect(() => {
    callbacks.current = { onScratchStart, onScratchFrame, onScratchEnd };
  });

  const registry = useMemo<Registry>(
    () => ({
      register(target) {
        targets.current.add(target);
        return () => {
          targets.current.delete(target);
        };
      },
    }),
    [],
  );

  const flush = useCallback(() => {
    frame.current = null;

    const active: ScratchTarget[] = [];
    targets.current.forEach((t) => {
      if (t.isActive()) active.push(t);
    });
    for (const t of active) t.beginFrame();

    let distance = 0;
    pointers.current.forEach((track) => {
      if (track.queue.length === 0) return;
      let a = track.last;
      for (const b of track.queue) {
        let hit = false;
        for (const t of active) {
          if (t.scratch(a, b)) hit = true;
        }
        if (hit) distance += Math.hypot(b.x - a.x, b.y - a.y);
        a = b;
      }
      track.last = a;
      track.queue.length = 0;
    });

    for (const t of active) t.endFrame();
    if (distance > 0) callbacks.current.onScratchFrame?.(distance);
  }, []);

  const schedule = useCallback(() => {
    if (frame.current == null) frame.current = requestAnimationFrame(flush);
  }, [flush]);

  useEffect(
    () => () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const hasActiveTarget = () => {
    for (const t of targets.current) if (t.isActive()) return true;
    return false;
  };

  const finishPointer = useCallback(
    (el: HTMLElement, pointerId: number) => {
      if (!pointers.current.has(pointerId)) return;
      // Draw whatever is still queued so the tail of the stroke is never lost.
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      flush();
      pointers.current.delete(pointerId);
      try {
        if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      } catch {
        /* pointer already gone */
      }
      if (pointers.current.size === 0) callbacks.current.onScratchEnd?.();
    },
    [flush],
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const isMouse = e.pointerType === "mouse";
    if (isMouse && e.button !== 0) return;

    const target = e.target as Element;
    const onFoil = target instanceof HTMLCanvasElement && target.dataset.scratch === "active";
    // Touch & pen must begin on foil — anywhere else the browser may scroll.
    if (!isMouse && !onFoil) return;
    if (!hasActiveTarget()) return;

    if (isMouse) e.preventDefault(); // no text selection / ghost image drag
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture not supported — events still bubble */
    }

    const p = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, { last: p, queue: [p] });
    callbacks.current.onScratchStart?.();
    schedule();
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const track = pointers.current.get(e.pointerId);
    if (!track) return;

    // Mouse released outside the window without a pointerup → end cleanly.
    if (e.pointerType === "mouse" && e.buttons === 0) {
      finishPointer(e.currentTarget, e.pointerId);
      return;
    }

    const native = e.nativeEvent;
    const coalesced =
      typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    if (coalesced.length > 0) {
      for (const c of coalesced) track.queue.push({ x: c.clientX, y: c.clientY });
    } else {
      track.queue.push({ x: e.clientX, y: e.clientY });
    }
    schedule();
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const track = pointers.current.get(e.pointerId);
    if (track) track.queue.push({ x: e.clientX, y: e.clientY });
    finishPointer(e.currentTarget, e.pointerId);
  };

  const handlePointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    finishPointer(e.currentTarget, e.pointerId);
  };

  const handleLostCapture = (e: ReactPointerEvent<HTMLDivElement>) => {
    // `lostpointercapture` bubbles. On touch, the canvas holds an implicit
    // capture that is handed over to this area in pointerdown — that hand-over
    // must NOT end the stroke. Only react when the area itself loses capture.
    if (e.target !== e.currentTarget) return;
    finishPointer(e.currentTarget, e.pointerId);
  };

  return (
    <ScratchContext.Provider value={registry}>
      <div
        className={cn("scratch-area", className)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostCapture}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => {
          if (pointers.current.size > 0) e.preventDefault();
        }}
      >
        {children}
      </div>
    </ScratchContext.Provider>
  );
}
