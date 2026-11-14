import { wedding } from "@/config";
import { Kolam, Ornament } from "./Decor";
import { ScratchDate } from "./ScratchDate";
import { Eyebrow, Reveal } from "./ui";

/** The printed-card look with the three scratch-off hearts. */
export function SaveTheDate() {
  return (
    <section id="date" className="relative px-4 pt-12 pb-24 sm:px-6 sm:pt-16 sm:pb-32">
      <Reveal className="mx-auto w-full max-w-xl">
        <div className="relative overflow-hidden rounded-[30px] bg-ivory px-5 pt-12 pb-10 text-center shadow-[0_40px_90px_-40px_rgba(80,60,30,0.5)] ring-1 ring-[#eadfc8] sm:px-12 sm:pt-14 sm:pb-12">
          {/* double border */}
          <div
            className="pointer-events-none absolute inset-2.5 rounded-[23px] border border-gold-300/60 sm:inset-3.5"
            aria-hidden="true"
          />
          <Kolam className="absolute -top-5 -left-20 w-56 -rotate-12 text-gold-400/55 sm:-left-10 sm:w-72" />
          <Kolam className="absolute -right-20 -bottom-5 w-56 rotate-[168deg] text-gold-400/55 sm:-right-10 sm:w-72" />

          <div className="relative">
            <Eyebrow className="tracking-[0.42em]">A sacred invitation</Eyebrow>

            <h2 className="mt-5 font-script text-[3.1rem] leading-[1.1] text-ink min-[400px]:text-[3.5rem] sm:text-7xl">
              {wedding.partnerOne}
              <span className="mx-2 inline-block align-middle font-serif text-3xl text-gold-500 italic sm:text-4xl">
                &amp;
              </span>
              {wedding.partnerTwo}
            </h2>

            <p className="mt-3 font-serif text-xl text-sage-700 italic sm:text-2xl">request the honour of your presence</p>

            <Ornament className="mt-6" />

            <ScratchDate />
          </div>
        </div>
      </Reveal>

      <p className="mx-auto mt-8 max-w-xs text-center font-sans text-[11px] tracking-[0.3em] text-sage-600/90 uppercase">
        Join our families for a day of blessings and celebration
      </p>
    </section>
  );
}
