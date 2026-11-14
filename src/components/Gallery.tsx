import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImagePlus, Link2, Trash2, X } from "lucide-react";
import { galleryIsEmpty, galleryPhotos } from "@/assets/gallery";
import { Reveal, SectionHeading } from "./ui";

type Photo = { src: string; full: string; alt: string; ratio: string; id?: string; uploaded?: boolean };

const STORAGE_KEY = "wedding-gallery-uploads-v1";

function loadUploads(): Photo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Photo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUploads(photos: Photo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch {
    /* storage full — photos still show for this session */
  }
}

/** Resize + compress an image file to a data URL so it can be stored in the browser. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toDirectImage(url: string): string {
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
  const driveAlt = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveAlt) return `https://drive.google.com/thumbnail?id=${driveAlt[1]}&sz=w1600`;
  return trimmed;
}

export function Gallery() {
  const [uploads, setUploads] = useState<Photo[]>(() => loadUploads());
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [index, setIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploaded / pasted photos come first, then the configured gallery.
  const photos: Photo[] = [...uploads, ...galleryPhotos];

  useEffect(() => {
    saveUploads(uploads);
  }, [uploads]);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: Photo[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const dataUrl = await fileToDataUrl(file);
        added.push({
          src: dataUrl,
          full: dataUrl,
          alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Our moment",
          ratio: "3 / 2",
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          uploaded: true,
        });
      } catch {
        /* skip unreadable file */
      }
    }
    if (added.length > 0) setUploads((prev) => [...added, ...prev]);
  };

  const addByLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setLinkError("Please paste a full link starting with http:// or https://");
      return;
    }
    setLinkError("");
    const direct = toDirectImage(url);
    setUploads((prev) => [
      {
        src: direct,
        full: direct,
        alt: "Our moment",
        ratio: "3 / 2",
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        uploaded: true,
      },
      ...prev,
    ]);
    setLinkInput("");
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((p) => p.id !== id));
  };

  const clearUploads = () => setUploads([]);

  return (
    <section id="gallery" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="Moments"
        title="Snapshots of us"
        subtitle="A few of our favourite frames - tap any photo to see it larger."
      />

      {/* Option 2 — add photos by upload or by link */}
      <div className="mx-auto mt-10 max-w-3xl rounded-[24px] bg-ivory/90 p-5 ring-1 ring-gold-300/50 shadow-[0_24px_50px_-36px_rgba(80,60,30,0.6)] sm:p-6">
        <p className="text-center font-sans text-[10px] font-medium tracking-[0.3em] text-sage-600 uppercase">
          Add your photos
        </p>
        <p className="mx-auto mt-2 max-w-md text-center font-sans text-xs leading-relaxed text-ink/55">
          Photos added here appear immediately, but they are saved in this browser only — other guests
          won&apos;t see them. To show photos to everyone, save them in{" "}
          <span className="font-medium text-ink/70">src/assets/gallery/</span> as{" "}
          <span className="font-medium text-ink/70">gallery-6.jpg</span>,{" "}
          <span className="font-medium text-ink/70">gallery-7.jpg</span> and so on.
        </p>

        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-[11px] tracking-[0.2em] text-ivory uppercase shadow-[0_12px_24px_-12px_rgba(47,62,52,0.9)] transition hover:-translate-y-0.5 hover:bg-ink-deep"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Upload from device
          </button>

          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Link2
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-sage-600"
                aria-hidden="true"
              />
              <input
                type="url"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value);
                  setLinkError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addByLink();
                }}
                placeholder="Paste a Google Drive / Imgur link…"
                className="w-full rounded-full border border-gold-300/70 bg-paper/60 py-3 pr-4 pl-10 font-sans text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-gold-500 focus:bg-ivory focus:ring-4 focus:ring-gold-300/30"
              />
            </div>
            <button
              type="button"
              onClick={addByLink}
              className="shrink-0 rounded-full bg-gold-400 px-5 py-3 font-sans text-[11px] tracking-[0.2em] text-ink-deep uppercase transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Add
            </button>
          </div>
        </div>

        {linkError && <p className="mt-2 text-center font-sans text-xs text-[#b0533f]">{linkError}</p>}

        {uploads.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="font-sans text-[11px] text-ink/60">
              {uploads.length} photo{uploads.length === 1 ? "" : "s"} added on this device
            </span>
            <button
              type="button"
              onClick={clearUploads}
              className="inline-flex items-center gap-1.5 font-sans text-[11px] tracking-[0.14em] text-sage-700 uppercase underline decoration-gold-400 underline-offset-4 transition hover:text-ink"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remove all
            </button>
          </div>
        )}

        {galleryIsEmpty && uploads.length === 0 && (
          <p className="mt-3 text-center font-sans text-xs leading-relaxed text-ink/55">
            Tip: upload your photos above, or paste public links. They appear instantly below.
          </p>
        )}
      </div>

      <div className="mx-auto mt-12 max-w-6xl columns-2 gap-3 sm:gap-5 md:columns-3">
        {photos.map((photo, i) => (
          <Reveal key={`${photo.id ?? photo.src}-${i}`} delay={(i % 3) * 0.08} className="mb-3 break-inside-avoid sm:mb-5">
            <div className="group relative">
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="relative block w-full overflow-hidden rounded-2xl bg-gold-200/40 ring-1 ring-gold-300/40 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none sm:rounded-3xl"
                aria-label={`Open photo: ${photo.alt}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="block w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                  style={{ aspectRatio: photo.ratio }}
                />
                <span className="absolute inset-0 bg-linear-to-t from-ink-deep/50 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                <span className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2 opacity-0 transition duration-500 group-hover:opacity-100">
                  <span className="truncate text-left font-serif text-lg text-ivory italic">{photo.alt}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory/90 text-ink">
                    <Expand className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              </button>

              {photo.uploaded && photo.id && (
                <button
                  type="button"
                  onClick={() => removeUpload(photo.id!)}
                  className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink-deep/70 text-ivory opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 hover:bg-[#b0533f] focus-visible:opacity-100"
                  aria-label={`Remove photo: ${photo.alt}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {index !== null && photos[index] && (
        <Lightbox
          photo={photos[index]}
          index={index}
          total={photos.length}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  );
}

function Lightbox({
  photo,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, onPrev, onNext]);

  const navBtn =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/10 text-ivory ring-1 ring-ivory/30 backdrop-blur transition hover:bg-ivory/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fade-in fixed inset-0 z-[60] flex items-center justify-center bg-ink-deep/95 px-4 py-16 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(dx) > 50) {
          if (dx > 0) onPrev();
          else onNext();
        }
      }}
    >
      <figure className="relative flex max-h-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          key={photo.full}
          src={photo.full}
          alt={photo.alt}
          className="fade-in max-h-[78vh] w-auto rounded-xl object-contain shadow-2xl"
        />
        <figcaption className="mt-4 text-center font-serif text-lg text-ivory/90 italic">
          {photo.alt}
          <span className="ml-3 font-sans text-xs tracking-[0.2em] text-ivory/50 not-italic">
            {index + 1} / {total}
          </span>
        </figcaption>
      </figure>

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/10 text-ivory ring-1 ring-ivory/30 transition hover:bg-ivory/25"
        aria-label="Close photo viewer"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className={`${navBtn} left-3 sm:left-6`}
        aria-label="Previous photo"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className={`${navBtn} right-3 sm:right-6`}
        aria-label="Next photo"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
