import confetti from "canvas-confetti";
import { SHAPE_PATHS } from "@/components/scratch/shapes";

const GOLD = ["#d1ad5f", "#f1e2b8", "#b8913f", "#fff6dc"];
const PARTY = ["#d1ad5f", "#f1e2b8", "#e9c3bd", "#a7b598", "#fffdf8", "#b8913f"];

let heartShape: confetti.Shape | null = null;
function heart() {
  if (heartShape) return heartShape;
  try {
    // A pre-computed matrix (scale the 100×100 heart to ~10px, centred) skips
    // canvas-confetti's slow 1000×1000 bounds scan. It must be a plain array —
    // the renderer checks Array.isArray() even though the typings say DOMMatrix.
    heartShape = confetti.shapeFromPath({
      path: SHAPE_PATHS.heart,
      matrix: [0.105, 0, 0, 0.105, -5.25, -5.05] as unknown as DOMMatrix,
    });
  } catch {
    heartShape = "circle";
  }
  return heartShape;
}

/** A small burst of gold flakes where a heart was revealed. */
export function burstAt(rect: DOMRect) {
  if (!rect.width) return;
  void confetti({
    particleCount: 26,
    spread: 70,
    startVelocity: 20,
    gravity: 0.8,
    decay: 0.9,
    scalar: 0.7,
    ticks: 110,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
    colors: GOLD,
    disableForReducedMotion: true,
  });
}

/** The grand finale once the whole date is revealed. */
export function celebrate() {
  const shapes = [heart(), "circle", "square"] as confetti.Shape[];

  void confetti({
    particleCount: 110,
    spread: 100,
    startVelocity: 38,
    origin: { y: 0.55 },
    colors: PARTY,
    shapes,
    scalar: 0.95,
    disableForReducedMotion: true,
  });

  const end = Date.now() + 1300;
  const frame = () => {
    void confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: PARTY,
      shapes,
      disableForReducedMotion: true,
    });
    void confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: PARTY,
      shapes,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
