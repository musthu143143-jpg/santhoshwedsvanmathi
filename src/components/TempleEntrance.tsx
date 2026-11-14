import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Bell, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { coupleGreenscreen, doorsTall, doorsWide, templeInterior } from "@/assets/scene";
import { wedding } from "@/config";
import { useChromaKey, type KeyedImage } from "@/lib/chromaKey";
import { animateScrollTo } from "@/lib/scroll";
import { sound } from "@/lib/sound";
import { cn } from "@/utils/cn";
import { Petals } from "./Petals";

/* ------------------------------------------------------------------ */
/* Photographs & measurements                                          */
/* ------------------------------------------------------------------ */

type LeafBox = { left: number; right: number; top: number; bottom: number; seam: number };
type DoorArt = { src: string; aspect: number; leaves: LeafBox };

/**
 * Where the two door leaves sit in each photograph (fractions of its width /
 * height). `top` starts just under the hanging garland so the flowers stay on
 * the frame instead of swinging away. In the tall photo the seam sits on the
 * right edge of the carved centre strip, which swings with the left door —
 * exactly like the astragal on a real pair of doors.
 */
const DOOR_ART: Record<"wide" | "tall", DoorArt> = {
  wide: {
    src: doorsWide,
    aspect: 1568 / 882,
    leaves: { left: 0.3406, right: 0.6588, top: 0.262, bottom: 0.864, seam: 0.5013 },
  },
  tall: {
    src: doorsTall,
    aspect: 1024 / 1536,
    leaves: { left: 0.202, right: 0.803, top: 0.222, bottom: 0.815, seam: 0.518 },
  },
};

/** The mandapam photo: where its aisle vanishes and where the aisle floor ends. */
const INTERIOR = { aspect: 1568 / 882, vpX: 0.497, vpY: 0.537, aisleEndY: 0.635 };

/** Standing height ÷ how far the feet sit below the horizon (eye ≈ 1.6 m, person ≈ 1.75 m). */
const HEIGHT_PER_DROP = 1.094;

/** Scroll choreography, as fractions of the section's scroll distance. */
const T = {
  intro: [0.01, 0.07],
  open: [0.03, 0.3],
  approach: [0, 0.3],
  through: [0.27, 0.46],
  facadeFade: [0.37, 0.46],
  coupleIn: [0.1, 0.24],
  walk: [0.47, 0.97],
  /** The parents' welcome rises as the leaves part… */
  welcomeIn: [0.12, 0.2],
  /** …and steps aside as the visitor walks into the mandapam. */
  welcomeOut: [0.38, 0.46],
} as const;
const PHASES = [0.4, 0.64, 0.84] as const;
/** "Open the temple doors" stops here: doors wide open, parents' welcome showing. */
const OPEN_TARGET = 0.3;
/** "Enter with their blessings" walks the camera into the temple. */
const ENTER_TARGET = 0.56;
const MAX_DOOR_ANGLE = 86;
const STEPS = 16;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInQuad = (t: number) => t * t;
const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
const phaseOf = (p: number) => (p < PHASES[0] ? 0 : p < PHASES[1] ? 1 : p < PHASES[2] ? 2 : 3);

type Box = { x: number; y: number; w: number; h: number };
type Geometry = {
  cw: number;
  ch: number;
  art: DoorArt;
  stage: Box;
  interior: Box;
  /** Vanishing point of the aisle, in viewport px. */
  vp: { x: number; y: number };
  /** Centre of the doorway, in viewport px. */
  door: { x: number; y: number };
  perspective: number;
};

/** A box with the given aspect ratio that covers cw × ch (like object-fit: cover). */
function cover(cw: number, ch: number, aspect: number): Box {
  const w = Math.max(cw, ch * aspect);
  const h = Math.max(ch, cw / aspect);
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

function measure(cw: number, ch: number): Geometry {
  const art = cw >= ch ? DOOR_ART.wide : DOOR_ART.tall;
  const { left, right, top, bottom, seam } = art.leaves;
  const stage = cover(cw, ch, art.aspect);
  const interior = cover(cw, ch, INTERIOR.aspect);
  return {
    cw,
    ch,
    art,
    stage,
    interior,
    vp: { x: interior.x + interior.w * INTERIOR.vpX, y: interior.y + interior.h * INTERIOR.vpY },
    door: { x: stage.x + stage.w * ((left + right) / 2), y: stage.y + stage.h * ((top + bottom) / 2) },
    // About 3× the leaf width gives a natural swing without a fish-eye look.
    perspective: stage.w * (seam - left) * 3.1,
  };
}

/** A rectangular slice of the photo that lines up exactly with the full-frame copy beneath it. */
function slice(x0: number, x1: number, y0: number, y1: number): CSSProperties {
  const w = x1 - x0;
  const h = y1 - y0;
  return {
    left: pct(x0),
    top: pct(y0),
    width: pct(w),
    height: pct(h),
    backgroundSize: `${pct(1 / w)} ${pct(1 / h)}`,
    backgroundPosition: `${pct(x0 / (1 - w))} ${pct(y0 / (1 - h))}`,
  };
}

function doorLayout({ leaves }: DoorArt) {
  const { left, right, top, bottom, seam } = leaves;
  const grow = 0.002; // leaves overlap the frame a hair, so no hairline gaps
  const lip = 0.004; // the opening is slightly smaller, leaving a door-stop lip on the frame
  const overlap = 0.0008; // leaves overlap each other at the seam
  const hole = { l: left + lip, r: right - lip, t: top + lip * 0.75, b: bottom - lip * 0.75 };
  const ring = [
    [hole.l, hole.t],
    [hole.r, hole.t],
    [hole.r, hole.b],
    [hole.l, hole.b],
    [hole.l, hole.t],
  ]
    .map(([x, y]) => `${pct(x)} ${pct(y)}`)
    .join(", ");

  return {
    left: slice(left - grow, seam + overlap, top - grow, bottom + grow),
    right: slice(seam - overlap, right + grow, top - grow, bottom + grow),
    hole: {
      left: pct(hole.l),
      top: pct(hole.t),
      width: pct(hole.r - hole.l),
      height: pct(hole.b - hole.t),
    } as CSSProperties,
    // Even-odd polygon = the whole photo with the doorway punched out.
    frameClip: `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${ring})`,
    seam: { left: pct(seam), top: pct(top + 0.012), height: pct(bottom - top - 0.024) } as CSSProperties,
    origin: `${pct((left + right) / 2)} ${pct((top + bottom) / 2)}`,
  };
}

/** Final (nearest) on-screen size of the couple, respecting perspective and screen width. */
function coupleSize(g: Geometry, aspect: number) {
  const byDepth = HEIGHT_PER_DROP * (g.ch * 1.08 - g.vp.y);
  const byWidth = (g.cw * 0.86) / aspect;
  const h = Math.max(160, Math.min(byDepth, byWidth));
  return { w: h * aspect, h, nearDrop: h / HEIGHT_PER_DROP };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function Stage({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div className={cn("temple-stage", active && "is-current")} aria-hidden={!active}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The scene                                                           */
/* ------------------------------------------------------------------ */

/**
 * A sticky, scroll-driven scene:
 *  1. real photographic temple doors, closed;
 *  2. scrolling (or the button) swings both leaves inward in 3D;
 *  3. the camera passes through the doorway into the mandapam;
 *  4. the bride and groom walk towards you down the aisle.
 */
export function TempleEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const insideRef = useRef<HTMLDivElement>(null);
  const coupleRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const facadeRef = useRef<HTMLDivElement>(null);
  const leftLeafRef = useRef<HTMLDivElement>(null);
  const rightLeafRef = useRef<HTMLDivElement>(null);
  const leftShadeRef = useRef<HTMLDivElement>(null);
  const rightShadeRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introActionsRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);

  const [geo, setGeo] = useState<Geometry | null>(null);
  const [phase, setPhase] = useState(0);
  const keyed = useChromaKey(coupleGreenscreen);
  const reduced = usePrefersReducedMotion();

  const geoRef = useRef<Geometry | null>(null);
  const keyedRef = useRef<KeyedImage | null>(null);
  const reducedRef = useRef(reduced);
  const phaseRef = useRef(0);
  const rangRef = useRef(false);
  const stopScrollRef = useRef<(() => void) | null>(null);

  const art = geo?.art;
  const doors = useMemo(() => (art ? doorLayout(art) : null), [art]);

  /** Applies the scroll position to every layer. Direct DOM writes — no React render per frame. */
  const frame = useCallback(() => {
    const section = sectionRef.current;
    const g = geoRef.current;
    if (!section || !g) return;

    const travel = Math.max(1, section.offsetHeight - g.ch);
    const p = clamp01(-section.getBoundingClientRect().top / travel);
    const still = reducedRef.current;

    const open = easeInOutSine(span(p, T.open));
    const approach = easeInOutSine(span(p, T.approach));
    const through = easeInQuad(span(p, T.through));
    const walk = span(p, T.walk);
    const facadeOpacity = 1 - span(p, T.facadeFade);
    const facadeScale = still ? 1 : 1 + approach * 0.1 + through * 2.3;
    const insideScale = still ? 1.02 : 1.02 + approach * 0.05 + through * 0.08 + walk * 0.16;

    const style = (el: HTMLElement | null, prop: "transform" | "opacity" | "visibility", value: string) => {
      if (el) el.style[prop] = value;
    };

    // Doors swing inward around their hinges.
    const angle = open * MAX_DOOR_ANGLE;
    style(leftLeafRef.current, "transform", `rotateY(${angle.toFixed(3)}deg)`);
    style(rightLeafRef.current, "transform", `rotateY(${(-angle).toFixed(3)}deg)`);
    const shade = (open * 0.85).toFixed(3);
    style(leftShadeRef.current, "opacity", shade);
    style(rightShadeRef.current, "opacity", shade);
    style(seamRef.current, "opacity", ((1 - clamp01(open * 6)) * 0.8).toFixed(3));
    style(lightRef.current, "opacity", (open * (1 - through) * 0.9).toFixed(3));
    style(
      bloomRef.current,
      "opacity",
      (Math.sin(Math.PI * clamp01(open * 1.15)) * 0.55 * (1 - through)).toFixed(3),
    );

    // Walk up to the doorway, then through it.
    style(facadeRef.current, "transform", `scale(${facadeScale.toFixed(4)})`);
    style(facadeRef.current, "opacity", facadeOpacity.toFixed(3));
    style(facadeRef.current, "visibility", facadeOpacity <= 0.001 ? "hidden" : "visible");
    style(insideRef.current, "transform", `scale(${insideScale.toFixed(4)})`);

    // Copy on the closed doors.
    const introT = span(p, T.intro);
    style(introRef.current, "opacity", (1 - introT).toFixed(3));
    style(introRef.current, "transform", `translate3d(0, ${(-introT * 18).toFixed(2)}px, 0)`);
    style(introRef.current, "visibility", introT >= 0.85 ? "hidden" : "visible");
    if (introActionsRef.current) {
      introActionsRef.current.style.pointerEvents = introT < 0.25 ? "auto" : "none";
    }

    // The parents rise into view as the doors open and bless the visitor in,
    // then fade away once the camera moves inside.
    const welcomeEl = welcomeRef.current;
    if (welcomeEl) {
      const welcomeIn = easeInOutSine(span(p, T.welcomeIn));
      const welcomeOut = 1 - span(p, T.welcomeOut);
      const welcomeOpacity = clamp01(welcomeIn * welcomeOut);
      welcomeEl.style.opacity = welcomeOpacity.toFixed(3);
      welcomeEl.style.transform =
        `translate3d(0, ${(((1 - welcomeIn) * 0.05 - (1 - welcomeOut) * 0.06) * g.ch).toFixed(2)}px, 0)` +
        ` scale(${(0.95 + 0.05 * welcomeIn).toFixed(3)})`;
      welcomeEl.style.filter = `blur(${((1 - welcomeIn) * 8).toFixed(2)}px)`;
      welcomeEl.style.visibility = welcomeOpacity < 0.02 ? "hidden" : "visible";
      welcomeEl.style.pointerEvents = welcomeOpacity > 0.6 ? "auto" : "none";
      // Keep the hidden card out of the tab order and the accessibility tree.
      welcomeEl.toggleAttribute("inert", welcomeOpacity <= 0.6);
    }

    // The couple: waiting by the sanctum, then walking towards us in true perspective
    // (on-screen size and distance below the horizon both grow as 1 / distance).
    const coupleEl = coupleRef.current;
    const subject = keyedRef.current;
    if (coupleEl && subject) {
      const size = coupleSize(g, subject.aspect);
      const farDrop = (INTERIOR.aisleEndY - INTERIOR.vpY) * g.interior.h * insideScale;
      const drop = 1 / lerp(1 / farDrop, 1 / size.nearDrop, walk);
      const scale = (drop * HEIGHT_PER_DROP) / size.h;
      const feetY = g.vp.y + drop;
      coupleEl.style.transform = `translate3d(${(g.vp.x - size.w / 2).toFixed(2)}px, ${(feetY - size.h).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      coupleEl.style.opacity = span(p, T.coupleIn).toFixed(3);

      const stepEl = stepRef.current;
      if (stepEl) {
        const walking = !still && walk > 0 && walk < 1;
        const a = walk * STEPS * Math.PI;
        const bob = walking ? Math.abs(Math.sin(a)) * size.h * 0.012 : 0;
        const swayX = walking ? Math.sin(a) * size.w * 0.008 : 0;
        const tilt = walking ? Math.sin(a) * 0.6 : 0;
        stepEl.style.transform = `translate3d(${swayX.toFixed(2)}px, ${(-bob).toFixed(2)}px, 0) rotate(${tilt.toFixed(3)}deg)`;
      }
    }

    // A temple bell as the doors part (plays only once sound has been unlocked by a tap).
    if (open > 0.02 && !rangRef.current) {
      rangRef.current = true;
      sound.templeBell();
    }

    const next = phaseOf(p);
    if (next !== phaseRef.current) {
      phaseRef.current = next;
      setPhase(next);
    }
  }, []);

  // Measure the viewport: which photo to use and where every layer sits.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const next = measure(el.clientWidth, el.clientHeight);
      const prev = geoRef.current;
      if (prev && prev.cw === next.cw && prev.ch === next.ch) return;
      geoRef.current = next;
      setGeo(next);
    };
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-apply whenever the layout, the keyed couple or the motion preference changes.
  useLayoutEffect(() => {
    keyedRef.current = keyed;
    reducedRef.current = reduced;
    frame();
  }, [geo, keyed, reduced, frame]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        frame();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [frame]);

  useEffect(() => () => stopScrollRef.current?.(), []);

  const openDoors = () => {
    sound.unlock();
    sound.templeBell();
    rangRef.current = true;
    const section = sectionRef.current;
    const g = geoRef.current;
    if (!section || !g) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const target = top + (section.offsetHeight - g.ch) * OPEN_TARGET;
    stopScrollRef.current?.();
    if (reducedRef.current) window.scrollTo(0, target);
    else stopScrollRef.current = animateScrollTo(target, 3800);
  };

  const enterTemple = () => {
    sound.unlock();
    sound.chime(0, 0.06);
    const section = sectionRef.current;
    const g = geoRef.current;
    if (!section || !g) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const target = top + (section.offsetHeight - g.ch) * ENTER_TARGET;
    stopScrollRef.current?.();
    if (reducedRef.current) window.scrollTo(0, target);
    else stopScrollRef.current = animateScrollTo(target, 2600);
  };

  const coupleBox = geo && keyed ? coupleSize(geo, keyed.aspect) : null;
  const names = (
    <>
      {wedding.partnerOne} <span className="text-gold-300">&amp;</span> {wedding.partnerTwo}
    </>
  );

  return (
    <section
      id="top"
      ref={sectionRef}
      className="temple-entrance"
      aria-label={`Enter the temple for ${wedding.partnerOne} and ${wedding.partnerTwo}'s wedding`}
    >
      <div ref={viewportRef} className="temple-entrance__viewport">
        {geo && doors && (
          <>
            {/* Inside the temple */}
            <div
              ref={insideRef}
              className="temple-inside"
              style={{ transformOrigin: `${geo.vp.x}px ${geo.vp.y}px` }}
              aria-hidden="true"
            >
              <img
                src={templeInterior}
                alt=""
                draggable={false}
                className="temple-inside__photo"
                style={{ left: geo.interior.x, top: geo.interior.y, width: geo.interior.w, height: geo.interior.h }}
              />
              <span className="temple-inside__glow" style={{ left: geo.vp.x, top: geo.vp.y }} />
            </div>

            {/* The bride and groom, far down the aisle */}
            {keyed && coupleBox && (
              <div ref={coupleRef} className="temple-couple" style={{ width: coupleBox.w, height: coupleBox.h }}>
                <span className="temple-couple__shadow" aria-hidden="true" />
                <div ref={stepRef} className="temple-couple__step">
                  <img
                    src={keyed.url}
                    alt={`${wedding.partnerOne} and ${wedding.partnerTwo} walking hand in hand down the temple aisle`}
                    draggable={false}
                    className="temple-couple__img"
                  />
                </div>
              </div>
            )}

            <div className="temple-vignette absolute inset-0" aria-hidden="true" />

            {/* The temple front: one photograph split into a fixed frame and two swinging leaves */}
            <div
              ref={facadeRef}
              className="door-facade"
              style={{ transformOrigin: `${geo.door.x}px ${geo.door.y}px` }}
              aria-hidden="true"
            >
              <div
                className="door-stage"
                style={
                  {
                    left: geo.stage.x,
                    top: geo.stage.y,
                    width: geo.stage.w,
                    height: geo.stage.h,
                    perspective: `${geo.perspective.toFixed(1)}px`,
                    perspectiveOrigin: doors.origin,
                    "--door-img": `url("${geo.art.src}")`,
                  } as CSSProperties
                }
              >
                <div className="door-frame" style={{ clipPath: doors.frameClip, WebkitClipPath: doors.frameClip }} />
                <div className="door-jamb" style={doors.hole} />
                <div ref={lightRef} className="door-light" style={doors.hole} />
                <div ref={leftLeafRef} className="door-leaf door-leaf--left" style={doors.left}>
                  <div ref={leftShadeRef} className="door-leaf__shade" />
                </div>
                <div ref={rightLeafRef} className="door-leaf door-leaf--right" style={doors.right}>
                  <div ref={rightShadeRef} className="door-leaf__shade" />
                </div>
                <div ref={seamRef} className="door-seam" style={doors.seam} />
              </div>
            </div>

            <div
              ref={bloomRef}
              className="door-bloom"
              style={{ "--bx": `${geo.door.x}px`, "--by": `${geo.door.y}px` } as CSSProperties}
              aria-hidden="true"
            />
          </>
        )}

        <Petals className="opacity-80" />
        <div className="entrance-scrim entrance-scrim--top" aria-hidden="true" />
        <div className="entrance-scrim entrance-scrim--bottom" aria-hidden="true" />

        {/* On the closed doors */}
        <div ref={introRef} className="entrance-intro">
          <div className="entrance-intro__top">
            <p className="entrance-eyebrow">॥ Shubha Vivaham ॥</p>
            <h1 className="mt-3 font-serif text-[2.5rem] leading-none text-ivory drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)] min-[400px]:text-5xl sm:text-6xl">
              {names}
            </h1>
            <p lang="ta" className="mt-3 font-script text-lg text-gold-200/95 sm:text-xl">
              {wedding.partnerOneTamil} · {wedding.partnerTwoTamil}
            </p>
          </div>

          <div className="entrance-intro__bottom" ref={introActionsRef}>
            <button
              type="button"
              onClick={openDoors}
              className="inline-flex items-center gap-2.5 rounded-full bg-gold-300 px-7 py-3.5 font-sans text-[11px] font-medium tracking-[0.24em] text-ink-deep uppercase shadow-[0_18px_40px_-14px_rgba(0,0,0,0.85)] ring-1 ring-gold-200/70 transition hover:-translate-y-0.5 hover:bg-gold-200 focus-visible:ring-4 focus-visible:ring-gold-200/70 focus-visible:outline-none"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              Open the temple doors
            </button>
            <p className="mt-4 flex flex-col items-center gap-1 font-sans text-[10px] tracking-[0.34em] text-ivory/75 uppercase">
              or scroll to push them open
              <ChevronDown className="bob-y h-4 w-4" aria-hidden="true" />
            </p>
          </div>

          <a href="#date" className="entrance-skip">
            Skip intro
          </a>
        </div>

        {/* The parents' welcome, revealed as the doors swing open */}
        <div
          ref={welcomeRef}
          className="entrance-welcome"
          role="group"
          aria-label="A welcome from the parents of the bride and groom"
        >
          <div className="entrance-welcome__card">
            <p className="entrance-eyebrow">With folded hands</p>
            <h2 className="entrance-welcome__title">{wedding.welcome.heading}</h2>
            <p className="entrance-welcome__names">
              {wedding.partnerOne} <span aria-hidden="true">&amp;</span> {wedding.partnerTwo}
            </p>

            <figure className="entrance-welcome__frame">
              <img src={wedding.welcome.image} alt={wedding.welcome.alt} draggable={false} />
            </figure>

            <p className="entrance-welcome__note">{wedding.welcome.note}</p>

            <button type="button" onClick={enterTemple} className="entrance-welcome__cta">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {wedding.welcome.cta}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Inside the temple */}
        <div className="entrance-copy">
          <Stage active={phase === 1}>
            <p className="entrance-eyebrow">With the blessings of our elders</p>
            <h2 className="mt-4 font-serif text-5xl leading-[1.05] text-ivory drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-7xl">
              {names}
            </h2>
            <p lang="ta" className="mt-3 font-script text-xl text-gold-200 sm:text-2xl">
              {wedding.partnerOneTamil} · {wedding.partnerTwoTamil}
            </p>
            <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-ivory/85 sm:text-base">
              joyfully invite you to celebrate their wedding
            </p>
          </Stage>

          <Stage active={phase === 2}>
            <p className="entrance-eyebrow">Inside the mandapam</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ivory drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-6xl">
              Where two families become one
            </h2>
            <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-ivory/85 sm:text-base">
              Walk with us beneath the lamps, towards the sacred fire.
            </p>
          </Stage>

          <Stage active={phase === 3}>
            <p className="entrance-eyebrow flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> A sacred beginning
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ivory drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-6xl">
              Our muhurtham awaits
            </h2>
            <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-ivory/85 sm:text-base">
              The date is hidden beneath three golden seals.
            </p>
            <a
              href="#date"
              tabIndex={phase === 3 ? 0 : -1}
              className={cn(
                "mt-6 inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3 font-sans text-[11px] tracking-[0.22em] text-ink uppercase shadow-[0_16px_36px_-15px_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5 hover:bg-white",
                phase === 3 ? "pointer-events-auto" : "pointer-events-none",
              )}
            >
              <Sparkles className="h-4 w-4 text-gold-500" aria-hidden="true" />
              Reveal the date
            </a>
          </Stage>
        </div>

        <div className={cn("entrance-hint", phase === 1 && "is-visible")} aria-hidden="true">
          <span>Keep scrolling · walk with them</span>
          <ChevronDown className="bob-y h-4 w-4" />
        </div>
      </div>
    </section>
  );
}
