import { useEffect, useState } from "react";

export type KeyedImage = {
  /** Transparent PNG (object URL) cropped tightly to the subject. */
  url: string;
  /** width / height of the cropped subject. */
  aspect: number;
};

const MAX_HEIGHT = 1200;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = x <= edge0 ? 0 : x >= edge1 ? 1 : (x - edge0) / (edge1 - edge0);
  return t * t * (3 - 2 * t);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

/**
 * Removes a flat chroma-green studio background, cleans the green fringe off
 * the edges and crops to the subject. Runs once in the browser (~50 ms).
 */
export async function keyGreenScreen(src: string): Promise<KeyedImage> {
  const img = await loadImage(src);
  const scale = Math.min(1, MAX_HEIGHT / img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);

  const frame = ctx.getImageData(0, 0, w, h);
  const d = frame.data;
  const alpha = new Uint8ClampedArray(w * h);

  // Pass 1 — "how much greener than red/blue", weighted by brightness: bright
  // studio green disappears while the garlands' dark leaves survive.
  for (let k = 0, i = 0; k < alpha.length; k++, i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const m = r > b ? r : b;
    const diff = g - m;
    if (diff <= 0) {
      alpha[k] = 255;
      continue;
    }
    const score = (diff * g) / 255;
    alpha[k] = Math.round((1 - smoothstep(36, 100, score)) * 255);
    d[i + 1] = g - diff * smoothstep(8, 60, score); // gentle despill
  }

  // Pass 2 — pixels touching the background: soften and fully despill (no green halo).
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      const i = k * 4;
      let a = alpha[k];
      if (a === 0) {
        d[i + 3] = 0;
        continue;
      }
      const edge =
        (x > 0 && alpha[k - 1] === 0) ||
        (x < w - 1 && alpha[k + 1] === 0) ||
        (y > 0 && alpha[k - w] === 0) ||
        (y < h - 1 && alpha[k + w] === 0);
      if (edge) {
        a >>= 1;
        const m = d[i] > d[i + 2] ? d[i] : d[i + 2];
        if (d[i + 1] > m) d[i + 1] = m;
      }
      d[i + 3] = a;
      if (a > 96) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("Nothing left after keying");

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;

  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const octx = out.getContext("2d");
  if (!octx) throw new Error("2D canvas unavailable");
  octx.putImageData(frame, -minX, -minY, minX, minY, cw, ch);

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  const url = blob ? URL.createObjectURL(blob) : out.toDataURL("image/png");
  return { url, aspect: cw / ch };
}

/** Keys the image once the browser is idle. Returns null until it's ready (or if it fails). */
export function useChromaKey(src: string) {
  const [result, setResult] = useState<KeyedImage | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;

    const run = () => {
      keyGreenScreen(src)
        .then((res) => {
          if (cancelled) {
            if (res.url.startsWith("blob:")) URL.revokeObjectURL(res.url);
            return;
          }
          created = res.url;
          setResult(res);
        })
        .catch(() => {
          /* keep the subject hidden rather than showing a green box */
        });
    };

    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(run, { timeout: 1200 }) : window.setTimeout(run, 300);

    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      if (created?.startsWith("blob:")) URL.revokeObjectURL(created);
    };
  }, [src]);

  return result;
}
