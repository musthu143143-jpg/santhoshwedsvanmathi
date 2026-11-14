export type ScratchShape = "heart" | "circle" | "rounded";

/** SVG path data for each shape, authored inside a 100 × 100 box. */
export const SHAPE_PATHS: Record<ScratchShape, string> = {
  heart:
    "M50 92 C47 89 8 62 3 38 C-1 17 12 4 28 4 C38 4 46 10 50 18 C54 10 62 4 72 4 C88 4 101 17 97 38 C92 62 53 89 50 92 Z",
  circle: "M50 3 A47 47 0 1 1 50 97 A47 47 0 1 1 50 3 Z",
  rounded:
    "M14 2 H86 A12 12 0 0 1 98 14 V86 A12 12 0 0 1 86 98 H14 A12 12 0 0 1 2 86 V14 A12 12 0 0 1 14 2 Z",
};

/**
 * The "focus" region of each shape (x0, y0, x1, y1 as fractions of the box):
 * roughly where the hidden text sits. Clearing most of it reveals the card
 * even if the edges are still covered — nobody should have to scrub corners.
 */
export const SHAPE_FOCUS: Record<ScratchShape, [number, number, number, number]> = {
  heart: [0.24, 0.3, 0.76, 0.62],
  circle: [0.26, 0.32, 0.74, 0.68],
  rounded: [0.2, 0.3, 0.8, 0.7],
};

/** CSS mask (data URI) matching a shape — used to clip the foil sheen. */
export function shapeMaskUrl(shape: ScratchShape) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${SHAPE_PATHS[shape]}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
