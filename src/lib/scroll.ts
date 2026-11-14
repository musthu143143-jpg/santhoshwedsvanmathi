const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Cinematic programmatic scroll. Any wheel, touch or key input immediately
 * hands control back to the visitor. Returns a function that stops it.
 */
export function animateScrollTo(targetY: number, duration = 1200): () => void {
  const root = document.documentElement;
  const startY = window.scrollY;
  const delta = targetY - startY;
  if (Math.abs(delta) < 2) return () => {};

  // CSS smooth scrolling would fight a per-frame scrollTo.
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  const start = performance.now();
  let raf = 0;
  let done = false;

  const stop = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    root.style.scrollBehavior = previous;
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
  };

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + delta * easeInOutCubic(t));
    if (t < 1) raf = requestAnimationFrame(tick);
    else stop();
  };

  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);
  raf = requestAnimationFrame(tick);
  return stop;
}
