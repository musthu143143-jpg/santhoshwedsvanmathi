import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { wedding } from "@/config";
import { cn } from "@/utils/cn";
import { SoundToggle } from "./SoundToggle";

const LINKS = [
  { id: "date", label: "The Date" },
  { id: "story", label: "Our Story" },
  { id: "couple", label: "Bride & Groom" },
  { id: "details", label: "Details" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    // Stay transparent over the whole temple entrance; turn solid once it scrolls away.
    const onScroll = () => {
      const entrance = document.getElementById("top");
      const threshold = entrance
        ? entrance.getBoundingClientRect().top + window.scrollY + entrance.offsetHeight - window.innerHeight + 24
        : 40;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in the middle of the screen.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ids = [...LINKS.map((l) => l.id), "rsvp"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500",
        solid
          ? "bg-ivory/90 shadow-[0_12px_30px_-22px_rgba(60,40,20,0.55)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6" aria-label="Main">
        <a
          href="#top"
          className={cn(
            "font-script text-[2rem] leading-none transition-colors duration-500",
            solid ? "text-ink" : "text-white drop-shadow",
          )}
          aria-label={`${wedding.partnerOne} and ${wedding.partnerTwo} - back to top`}
        >
          {wedding.partnerOne[0]}
          <span className={solid ? "text-gold-500" : "text-gold-300"}>&amp;</span>
          {wedding.partnerTwo[0]}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => {
            const isActive = active === l.id;
            return (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={cn(
                    "relative py-2 font-sans text-[12px] tracking-[0.22em] uppercase transition-colors duration-300",
                    solid
                      ? isActive
                        ? "text-ink"
                        : "text-ink/65 hover:text-ink"
                      : isActive
                        ? "text-white"
                        : "text-white/80 hover:text-white",
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold-400 transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <SoundToggle
            className={
              solid
                ? "bg-ivory/80 text-sage-700 ring-gold-300/70 hover:text-ink"
                : "bg-white/10 text-white ring-white/40 hover:bg-white/20"
            }
          />
          <a
            href="#rsvp"
            className={cn(
              "hidden rounded-full px-5 py-2.5 font-sans text-[12px] tracking-[0.22em] uppercase transition duration-300 sm:inline-flex",
              solid
                ? "bg-ink text-ivory hover:bg-ink-deep"
                : "bg-white/15 text-white ring-1 ring-white/50 backdrop-blur hover:bg-white/25",
            )}
          >
            RSVP
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 transition md:hidden",
              solid ? "text-ink ring-gold-300/70" : "text-white ring-white/40",
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="border-t border-gold-300/40 px-6 pt-2 pb-6">
            {[...LINKS, { id: "rsvp", label: "RSVP" }].map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className={cn(
                    "flex items-center justify-between border-b border-gold-300/25 py-3.5 font-serif text-2xl transition-colors",
                    active === l.id ? "text-gold-600" : "text-ink",
                  )}
                >
                  {l.label}
                  <span className="font-sans text-[10px] tracking-[0.3em] text-sage-600 uppercase">
                    {active === l.id ? "Here" : ""}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
