import { ArrowUp, Heart } from "lucide-react";
import { wedding } from "@/config";
import { useDateReveal } from "@/context/DateReveal";
import { Kolam } from "./Decor";

const LINKS = [
  { href: "#date", label: "The Date" },
  { href: "#story", label: "Our Story" },
  { href: "#couple", label: "Bride & Groom" },
  { href: "#details", label: "Details" },
  { href: "#gallery", label: "Gallery" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  const { revealed } = useDateReveal();

  return (
    <footer className="relative overflow-hidden bg-ink-deep px-6 pt-24 pb-10 text-center text-ivory">
      <Kolam className="absolute -top-7 -left-28 w-72 rotate-12 text-gold-400/25" />
      <Kolam className="absolute -right-28 -bottom-7 w-72 rotate-[192deg] text-gold-400/25" />

      <div className="relative">
        <p className="font-sans text-[11px] tracking-[0.4em] text-gold-300 uppercase">A celebration with our families</p>

        <p className="mt-6 font-script text-6xl leading-tight sm:text-8xl">
          {wedding.partnerOne} <span className="text-gold-300">&amp;</span> {wedding.partnerTwo}
        </p>

        <p className="mt-5 font-serif text-xl text-ivory/85 italic sm:text-2xl">
          {revealed ? (
            <span className="fade-in">{wedding.longDate}</span>
          ) : (
            <a
              href="#date"
              className="underline decoration-gold-400/60 underline-offset-4 transition hover:text-ivory"
            >
              Our date is hidden in the golden seals
            </a>
          )}
        </p>
        <p className="mt-2 font-sans text-[11px] tracking-[0.3em] text-ivory/60 uppercase">
          {wedding.venue} · {wedding.city}
        </p>

        <p className="mt-8 font-sans text-sm tracking-[0.25em] text-gold-300">{wedding.hashtag}</p>

        <nav className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3" aria-label="Footer">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-[11px] tracking-[0.24em] text-ivory/70 uppercase transition hover:text-gold-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#top"
          className="mt-12 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-[11px] tracking-[0.24em] text-ivory/80 uppercase ring-1 ring-ivory/25 transition hover:bg-ivory/10 hover:text-ivory"
        >
          Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        <p className="mt-10 flex items-center justify-center gap-1.5 font-sans text-[11px] text-ivory/45">
          Made with <Heart className="h-3 w-3 fill-blush text-blush" aria-label="love" /> for our favourite people
        </p>
      </div>
    </footer>
  );
}
