import { Heart } from "lucide-react";
import { wedding } from "@/config";
import { cn } from "@/utils/cn";
import { Reveal, SectionHeading } from "./ui";

export function Story() {
  return (
    <section id="story" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="Our story"
        title="How it all began"
        subtitle="From filter coffee to a sunrise yes - a few of our favourite chapters so far."
      />

      <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
        {/* timeline spine */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[15px] w-px bg-linear-to-b from-transparent via-gold-300 to-transparent md:left-1/2"
        />

        <ol className="space-y-16 md:space-y-24">
          {wedding.story.map((item, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={item.year} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-2 left-[15px] z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-ivory shadow-sm ring-1 ring-gold-400 md:top-1/2 md:left-1/2 md:-translate-y-1/2"
                >
                  <Heart className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                </span>

                <Reveal className="grid items-center gap-7 pl-12 md:grid-cols-2 md:gap-24 md:pl-0">
                  <div className={cn(flip && "md:order-2")}>
                    <div className="relative mx-auto max-w-[340px]">
                      <div
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-0 translate-x-3 translate-y-3 rounded-t-[999px] rounded-b-3xl border border-gold-300/80",
                          flip && "-translate-x-3",
                        )}
                      />
                      <div className="relative overflow-hidden rounded-t-[999px] rounded-b-3xl bg-gold-200/40 shadow-[0_30px_60px_-34px_rgba(60,40,20,0.6)]">
                        <img
                          src={item.image}
                          alt={item.alt}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover transition duration-[1.2s] hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn(flip && "md:order-1 md:text-right")}>
                    <p className="font-script text-5xl leading-none text-gold-500 sm:text-6xl">{item.year}</p>
                    <h3 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">{item.title}</h3>
                    <p className="mt-4 font-sans text-[15px] leading-relaxed font-light text-ink/75">{item.text}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal className="mt-16 text-center md:mt-24">
          <p className="font-serif text-2xl text-ink italic sm:text-3xl">…and the best chapter is yet to come.</p>
        </Reveal>
      </div>
    </section>
  );
}
