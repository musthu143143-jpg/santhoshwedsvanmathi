import { SHAPE_FOCUS, SHAPE_PATHS, type ScratchShape } from "./shapes";

/** Small deterministic PRNG so the foil looks identical after a repaint. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pathCache = new Map<ScratchShape, Path2D>();

export function getUnitPath(shape: ScratchShape) {
  let path = pathCache.get(shape);
  if (!path) {
    path = new Path2D(SHAPE_PATHS[shape]);
    pathCache.set(shape, path);
  }
  return path;
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.closePath();
  ctx.fill();
}

/**
 * Paints the gold scratch-off foil, clipped to the shape.
 * `w`/`h` are CSS pixels; the canvas backing store is `w*dpr × h*dpr`.
 */
export function paintFoil(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  shape: ScratchShape,
  seed: number,
) {
  const rand = mulberry32(seed * 9973 + 17);
  const unit = getUnitPath(shape);
  const sx = w / 100;
  const sy = h / 100;
  const min = Math.min(w, h);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Clip to the shape (authored in a 100×100 box), then draw in CSS pixels.
  ctx.setTransform(dpr * sx, 0, 0, dpr * sy, 0, 0);
  ctx.clip(unit);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 1 · Metallic base
  const base = ctx.createLinearGradient(0, 0, w, h);
  const stops: Array<[number, string]> = [
    [0, "#9a722c"],
    [0.16, "#d6b35c"],
    [0.32, "#f7e5a4"],
    [0.47, "#c89b45"],
    [0.62, "#f2dc97"],
    [0.8, "#b4873a"],
    [1, "#e0c070"],
  ];
  for (const [offset, color] of stops) base.addColorStop(offset, color);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // 2 · Soft highlight
  const hl = ctx.createRadialGradient(w * 0.3, h * 0.24, 0, w * 0.3, h * 0.24, Math.max(w, h) * 0.62);
  hl.addColorStop(0, "rgba(255, 250, 226, 0.55)");
  hl.addColorStop(1, "rgba(255, 250, 226, 0)");
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, w, h);

  // 3 · Brushed-metal hairlines
  ctx.lineWidth = 0.6;
  for (let i = -h; i < w; i += 2.5) {
    ctx.strokeStyle =
      rand() > 0.5
        ? `rgba(255, 248, 220, ${0.05 + rand() * 0.1})`
        : `rgba(110, 78, 24, ${0.03 + rand() * 0.06})`;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }

  // 4 · Glitter grain (batched into four paths — fast even on phones)
  const grains = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
  const count = Math.round((w * h) / 7);
  for (let i = 0; i < count; i++) {
    const g = grains[Math.floor(rand() * 4)];
    const s = 0.6 + rand() * 0.9;
    g.rect(rand() * w, rand() * h, s, s);
  }
  const grainColors = [
    "rgba(255, 252, 236, 0.38)",
    "rgba(255, 246, 214, 0.2)",
    "rgba(92, 62, 14, 0.16)",
    "rgba(92, 62, 14, 0.08)",
  ];
  grains.forEach((g, i) => {
    ctx.fillStyle = grainColors[i];
    ctx.fill(g);
  });

  // 5 · Sparkles
  ctx.fillStyle = "rgba(255, 253, 240, 0.95)";
  sparkle(ctx, w * (0.64 + rand() * 0.1), h * (0.2 + rand() * 0.08), min * 0.075);
  sparkle(ctx, w * (0.76 + rand() * 0.05), h * (0.36 + rand() * 0.05), min * 0.035);
  sparkle(ctx, w * (0.26 + rand() * 0.08), h * (0.52 + rand() * 0.08), min * 0.042);

  // 6 · Embossed rim (inner shadow + light edge), still clipped to the shape
  ctx.setTransform(dpr * sx, 0, 0, dpr * sy, 0, 0);
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(104, 72, 20, 0.45)";
  ctx.lineWidth = 7 / sx;
  ctx.stroke(unit);
  ctx.strokeStyle = "rgba(255, 244, 204, 0.75)";
  ctx.lineWidth = 2.2 / sx;
  ctx.stroke(unit);

  ctx.restore();
}

export type CoverageGrid = {
  /** 0 = outside the shape, 1 = foil, 2 = scratched */
  cells: Uint8Array;
  /** 1 = cell is part of the focus (text) region */
  focus: Uint8Array;
  total: number;
  focusTotal: number;
};

const gridCache = new Map<string, CoverageGrid>();

/** Builds (and caches) the coverage grid template for a shape. */
export function createCoverageGrid(shape: ScratchShape, res: number): CoverageGrid {
  const key = `${shape}:${res}`;
  let template = gridCache.get(key);

  if (!template) {
    const cells = new Uint8Array(res * res);
    const focus = new Uint8Array(res * res);
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const ctx = probe.getContext("2d");
    const path = getUnitPath(shape);
    const [fx0, fy0, fx1, fy1] = SHAPE_FOCUS[shape];
    let total = 0;
    let focusTotal = 0;

    for (let j = 0; j < res; j++) {
      for (let i = 0; i < res; i++) {
        const u = (i + 0.5) / res;
        const v = (j + 0.5) / res;
        const inside = ctx ? ctx.isPointInPath(path, u * 100, v * 100) : true;
        if (!inside) continue;
        const k = j * res + i;
        cells[k] = 1;
        total++;
        if (u > fx0 && u < fx1 && v > fy0 && v < fy1) {
          focus[k] = 1;
          focusTotal++;
        }
      }
    }
    template = { cells, focus, total, focusTotal };
    gridCache.set(key, template);
  }

  // Each card gets its own mutable copy of the cells.
  return {
    cells: template.cells.slice(),
    focus: template.focus,
    total: template.total,
    focusTotal: template.focusTotal,
  };
}
