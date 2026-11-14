import { wedding } from "@/config";
import { Kolam } from "./Decor";
import { Eyebrow, Reveal } from "./ui";

export function MachanInvite() {
  const { machan } = wedding;

  return (
    <section id="machan" className="relative px-4 py-24 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-[30px] bg-ivory px-7 py-12 text-center ring-1 ring-gold-300/50 shadow-[0_40px_80px_-50px_rgba(80,60,30,0.7)] sm:px-14 sm:py-16">
          <Kolam className="pointer-events-none absolute -top-10 -left-12 w-40 text-gold-300/40" />
          <Kolam className="pointer-events-none absolute -right-12 -bottom-10 w-40 rotate-180 text-gold-300/40" />

          <Eyebrow>{machan.eyebrow}</Eyebrow>

          <h2 className="mt-3 font-serif text-3xl leading-tight font-medium text-ink sm:text-4xl">
            {machan.heading}
          </h2>

          <p className="mx-auto mt-5 max-w-xl font-sans text-[15px] leading-relaxed font-light text-ink/75">
            {machan.message}
          </p>

          <div className="mx-auto mt-8 h-px w-24 bg-gold-400/70" />

          <p className="mt-6 font-serif text-2xl text-gold-600 italic">{machan.name}</p>
          <p className="mt-1 font-sans text-[10px] font-medium tracking-[0.3em] text-sage-600 uppercase">
            {machan.relation}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
