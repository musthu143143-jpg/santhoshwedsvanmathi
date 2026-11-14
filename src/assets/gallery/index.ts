/**
 * GALLERY — photos come from:
 *  1. Local files in this folder: gallery-1.jpg, gallery-2.jpg, … (bundled into the site)
 *  2. Any extra public links pasted in ./links.ts (Option 2)
 *  3. Numbered placeholders only if both are empty.
 */
import { REMOTE_GALLERY_LINKS } from "./links";

export type GalleryPhoto = { src: string; full: string; alt: string; ratio: string };

/** Captions and tile shapes for photos, in order. */
const META: Array<{ alt: string; ratio: string }> = [
  { alt: "Santhosh & Vanmathi", ratio: "2 / 3" },
  { alt: "Under the floral arch", ratio: "3 / 2" },
  { alt: "Blessings from our family", ratio: "3 / 2" },
  { alt: "Together, always", ratio: "3 / 2" },
  { alt: "The two of us", ratio: "3 / 2" },
  { alt: "A quiet moment", ratio: "2 / 3" },
  { alt: "The groom", ratio: "9 / 16" },
  { alt: "Soulmates", ratio: "3 / 2" },
  { alt: "A portrait of us", ratio: "16 / 9" },
  { alt: "A night to remember", ratio: "2 / 3" },
];
const EXTRA_META = (n: number) => ({
  alt: `A moment from our celebration (${n})`,
  ratio: n % 3 === 0 ? "2 / 3" : "3 / 2",
});

/** Vite inlines these into the final single-file build. */
const modules = import.meta.glob("./gallery-*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const fileNumber = (path: string) => {
  const match = path.match(/(\d+)(?=\.[a-z0-9]+$)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

/** Convert a Google Drive share link into a direct image link. */
export function toDirectImage(url: string): string {
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
  const driveAlt = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveAlt) return `https://drive.google.com/thumbnail?id=${driveAlt[1]}&sz=w1600`;
  return trimmed;
}

/** Fallback: numbered placeholders so the section looks intentional before photos are added. */
const placeholder = (label: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff8e9"/><stop offset="1" stop-color="#f0dcb0"/>
      </linearGradient></defs>
      <rect width="900" height="1200" fill="url(#g)"/>
      <circle cx="450" cy="520" r="250" fill="none" stroke="#c99b3f" stroke-width="2.5" stroke-dasharray="7 10"/>
      <path d="M450 330c46 58 46 138 0 196-46-58-46-138 0-196Z" fill="#c99b3f" fill-opacity=".55" stroke="#a2703a" stroke-width="3"/>
      <path d="M450 400c70 0 122 52 122 118-70 0-122-52-122-118Z" fill="#d9b263" fill-opacity=".5" stroke="#a2703a" stroke-width="3"/>
      <path d="M450 400c-70 0-122 52-122 118 70 0 122-52 122-118Z" fill="#d9b263" fill-opacity=".5" stroke="#a2703a" stroke-width="3"/>
      <text x="450" y="780" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#7a3b1d">${label}</text>
      <text x="450" y="836" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" letter-spacing="7" fill="#a2703a">ADD YOUR PHOTO</text>
      <text x="450" y="888" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="#a2703a" fill-opacity=".8">src/assets/gallery</text>
    </svg>`,
  );

const localPhotos: GalleryPhoto[] = Object.keys(modules)
  .sort((a, b) => fileNumber(a) - fileNumber(b))
  .map((path, index) => {
    const meta = META[index] ?? EXTRA_META(index + 1);
    return { src: modules[path], full: modules[path], alt: meta.alt, ratio: meta.ratio };
  });

const remotePhotos: GalleryPhoto[] = REMOTE_GALLERY_LINKS.filter((u) => u.trim().length > 0).map(
  (url, index) => {
    const slot = localPhotos.length + index;
    const meta = META[slot] ?? EXTRA_META(slot + 1);
    const direct = toDirectImage(url);
    return { src: direct, full: direct, alt: meta.alt, ratio: meta.ratio };
  },
);

const combined: GalleryPhoto[] = [...localPhotos, ...remotePhotos];

export const galleryPhotos: GalleryPhoto[] =
  combined.length > 0
    ? combined
    : META.map((meta, index) => ({
        src: placeholder(`Photo ${index + 1}`),
        full: placeholder(`Photo ${index + 1}`),
        alt: meta.alt,
        ratio: meta.ratio,
      }));

/** True while no real photos are configured yet. */
export const galleryIsEmpty = combined.length === 0;
