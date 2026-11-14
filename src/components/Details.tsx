import {
  BedDouble,
  Bus,
  CalendarHeart,
  Car,
  Flame,
  Lock,
  MapPin,
  Music2,
  Navigation,
  Shirt,
  TrainFront,
  Utensils,
} from "lucide-react";
import { wedding } from "@/config";
import { useDateReveal } from "@/context/DateReveal";
import { mapEmbedUrl, mapsUrl } from "@/lib/calendar";
import { Eyebrow, Reveal, SectionHeading } from "./ui";

const EVENT_ICONS = { ceremony: Flame, drinks: Utensils, party: Music2 } as const;
const TRAVEL_ICONS = { train: TrainFront, car: Car, bus: Bus } as const;

const card =
  "rounded-[28px] bg-ivory ring-1 ring-gold-300/50 shadow-[0_30px_60px_-44px_rgba(80,60,30,0.6)]";

export function Details() {
  const { revealed } = useDateReveal();

  return (
    <section id="details" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="The celebration"
        title="Wedding day details"
        subtitle="Everything you need for a day of blessings, music and celebration in Oddanchatram."
      />

      {/* Date chip — unlocks once the seals are scratched */}
      <Reveal className="mt-8 flex justify-center">
        {revealed ? (
          <span className="fade-in inline-flex items-center gap-2.5 rounded-full bg-ivory px-6 py-2.5 font-serif text-lg text-ink ring-1 ring-gold-300/80">
            <CalendarHeart className="h-4 w-4 text-gold-500" aria-hidden="true" />
            {wedding.longDate}
          </span>
        ) : (
          <a
            href="#date"
            className="inline-flex items-center gap-2 rounded-full bg-gold-200/40 px-5 py-2.5 font-sans text-[11px] tracking-[0.2em] text-sage-700 uppercase ring-1 ring-gold-300/80 transition hover:bg-gold-200/70"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Date hidden · scratch the seals to reveal
          </a>
        )}
      </Reveal>

      {/* Order of the day */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
        {wedding.events.map((event, i) => {
          const Icon = EVENT_ICONS[event.icon];
          return (
            <Reveal key={event.title} delay={i * 0.1}>
              <article
                className={`${card} group h-full p-8 text-center transition duration-500 hover:-translate-y-1 hover:shadow-[0_40px_70px_-40px_rgba(80,60,30,0.65)] sm:p-10`}
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-200/50 text-gold-600 ring-1 ring-gold-300/70 transition duration-500 group-hover:bg-gold-400 group-hover:text-ivory">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-6 font-sans text-[11px] font-medium tracking-[0.34em] text-gold-600 uppercase">
                  {event.time}
                </p>
                <h3 className="mt-2 font-serif text-3xl font-medium text-ink">{event.title}</h3>
                <p className="mt-1 font-serif text-lg text-sage-600 italic">{event.place}</p>
                <p className="mx-auto mt-4 max-w-xs font-sans text-sm leading-relaxed font-light text-ink/70">
                  {event.note}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* Venue + map */}
      <Reveal className="mx-auto mt-6 max-w-6xl">
        <div className={`${card} grid overflow-hidden lg:grid-cols-[1.05fr_1fr]`}>
          <div className="p-8 sm:p-12">
            <Eyebrow>The venue</Eyebrow>
            <h3 className="mt-3 font-serif text-4xl font-medium text-ink sm:text-5xl">{wedding.venue}</h3>
            <p className="mt-3 flex items-start gap-2 font-sans text-sm text-ink/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
              {wedding.address}, {wedding.country}
            </p>
            <p className="mt-5 font-sans text-[15px] leading-relaxed font-light text-ink/75">{wedding.venueNote}</p>

            <ul className="mt-8 space-y-5">
              {wedding.travel.map((t) => {
                const Icon = TRAVEL_ICONS[t.icon];
                return (
                  <li key={t.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-300/35 text-sage-700">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-serif text-xl font-medium text-ink">{t.title}</p>
                      <p className="mt-0.5 font-sans text-sm leading-relaxed font-light text-ink/70">{t.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <a
              href={mapsUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-ivory shadow-[0_12px_24px_-14px_rgba(47,62,52,0.9)] transition hover:-translate-y-0.5 hover:bg-ink-deep"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Get directions
            </a>
          </div>

          <div className="relative min-h-[320px] bg-sage-300/30 lg:min-h-full">
            <iframe
              title={`Map showing ${wedding.venue}, ${wedding.city}`}
              src={mapEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0 [filter:sepia(0.18)_saturate(0.85)]"
            />
          </div>
        </div>
      </Reveal>

      {/* Stay + dress code */}
      <div className="mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-2">
        <Reveal>
          <div className={`${card} h-full p-8 sm:p-10`}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-200/50 text-gold-600 ring-1 ring-gold-300/70">
                <BedDouble className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <Eyebrow>Where to stay</Eyebrow>
                <h3 className="mt-1 font-serif text-3xl font-medium text-ink">Nearby rooms</h3>
              </div>
            </div>
            <ul className="mt-6 divide-y divide-gold-300/40">
              {wedding.hotels.map((h) => (
                <li key={h.name} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-serif text-xl font-medium text-ink">{h.name}</p>
                    <p className="mt-0.5 font-sans text-sm leading-relaxed font-light text-ink/70">{h.note}</p>
                  </div>
                  <span className="mt-1 shrink-0 rounded-full bg-sage-300/40 px-3 py-1 font-sans text-[10px] tracking-[0.16em] text-sage-700 uppercase">
                    {h.distance}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={`${card} h-full p-8 sm:p-10`}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-200/50 text-gold-600 ring-1 ring-gold-300/70">
                <Shirt className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <Eyebrow>Dress code</Eyebrow>
                <h3 className="mt-1 font-serif text-3xl font-medium text-ink">{wedding.dressCode.title}</h3>
              </div>
            </div>
            <p className="mt-6 font-sans text-[15px] leading-relaxed font-light text-ink/75">
              {wedding.dressCode.note}
            </p>
            <p className="mt-7 font-sans text-[11px] font-medium tracking-[0.28em] text-sage-700 uppercase">
              Our palette
            </p>
            <div className="mt-4 flex flex-wrap gap-5">
              {wedding.dressCode.palette.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2">
                  <span
                    className="h-12 w-12 rounded-full shadow-[0_8px_16px_-8px_rgba(0,0,0,0.35)] ring-4 ring-ivory outline outline-gold-300/60"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  <span className="font-sans text-[10px] tracking-[0.18em] text-ink/60 uppercase">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
