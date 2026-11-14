import { Heart, MapPin, Sparkles, Users } from "lucide-react";
import { wedding } from "@/config";
import { cn } from "@/utils/cn";
import { Eyebrow, Reveal, SectionHeading } from "./ui";

const people = [wedding.bride, wedding.groom] as const;

export function BrideGroom() {
  return (
    <section id="couple" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="The happy couple"
        title="Meet the bride & groom"
        subtitle="Two people, two families and a lifetime of small rituals, all gathered here with love."
      />

      <div className="mx-auto mt-14 grid max-w-6xl items-start gap-8 md:grid-cols-2">
        {people.map((person, i) => {
          const familyRows = [
            { icon: Users, label: person.relation, value: person.parents },
            { icon: Heart, label: "Blessed by", value: person.blessedBy },
            { icon: MapPin, label: "Hails from", value: person.hometown },
          ];

          return (
            <Reveal key={person.name} delay={i * 0.12}>
              <article className="group relative h-full overflow-hidden rounded-[30px] bg-ivory ring-1 ring-gold-300/50 shadow-[0_40px_80px_-50px_rgba(80,60,30,0.7)]">
                {/* Portrait in a temple-arch frame */}
                <div className="pt-9 pb-1">
                  <div className="relative mx-auto w-56 min-[400px]:w-64 sm:w-72">
                    <div
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 translate-y-3 rounded-t-[999px] rounded-b-3xl border border-gold-300/80",
                        i === 0 ? "translate-x-3" : "-translate-x-3",
                      )}
                    />
                    <div className="relative overflow-hidden rounded-t-[999px] rounded-b-3xl bg-gold-200/40 shadow-[0_30px_60px_-30px_rgba(60,20,10,0.55)] ring-1 ring-gold-300/60">
                      <img
                        src={person.image}
                        alt={person.alt}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover object-top transition duration-[1.2s] ease-out group-hover:scale-[1.05]"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-7 pt-4 pb-9 text-center sm:px-10">
                  <Eyebrow>{person.tag}</Eyebrow>
                  <h3 className="mt-2 font-serif text-4xl font-medium text-ink sm:text-5xl">{person.name}</h3>
                  <p lang="ta" className="mt-1 font-script text-2xl text-gold-500">
                    {person.tamil}
                  </p>

                  <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed font-light text-ink/75">
                    {person.about}
                  </p>

                  {/* Family */}
                  <div className="mx-auto mt-7 max-w-md">
                    <p className="font-sans text-[10px] font-medium tracking-[0.32em] text-sage-600 uppercase">
                      Their family
                    </p>
                    <ul className="mt-3 space-y-2.5 text-left">
                      {familyRows.map((row) => (
                        <li
                          key={row.label}
                          className="flex items-center gap-3.5 rounded-2xl bg-paper/70 px-4 py-3 ring-1 ring-gold-300/40"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-200/60 text-gold-600 ring-1 ring-gold-300/70">
                            <row.icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-sans text-[9px] font-medium tracking-[0.26em] text-sage-600 uppercase">
                              {row.label}
                            </span>
                            <span className="mt-0.5 block truncate font-serif text-base leading-snug text-ink sm:text-lg">
                              {row.value}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mx-auto mt-6 max-w-md font-serif text-lg text-gold-600 italic">“{person.quote}”</p>

                  <ul className="mt-6 flex flex-wrap justify-center gap-2">
                    {person.likes.map((like) => (
                      <li
                        key={like}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blush/20 px-3.5 py-1.5 font-sans text-[10px] tracking-[0.16em] text-ink/75 uppercase ring-1 ring-blush/50"
                      >
                        <Sparkles className="h-3 w-3 text-gold-500" aria-hidden="true" />
                        {like}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
