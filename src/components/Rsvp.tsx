import { useState, type FormEvent, type ReactNode } from "react";
import { Heart, Mail, PartyPopper } from "lucide-react";
import { wedding } from "@/config";
import { celebrate } from "@/lib/celebrate";
import { cn } from "@/utils/cn";
import { Reveal, SectionHeading } from "./ui";

type Attending = "yes" | "no" | "";

type RsvpForm = {
  name: string;
  email: string;
  attending: Attending;
  guests: string;
  meal: string;
  dietary: string;
  song: string;
  message: string;
};

type Errors = Partial<Record<keyof RsvpForm, string>>;

const EMPTY: RsvpForm = {
  name: "",
  email: "",
  attending: "",
  guests: "1",
  meal: "",
  dietary: "",
  song: "",
  message: "",
};

const MEALS = [
  "Herb-roasted chicken",
  "Pan-seared sea bass",
  "Wild mushroom risotto (v)",
  "Summer garden plate (vg)",
];

const STORAGE_KEY = "save-the-date:rsvp";

function loadSaved(): RsvpForm | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<RsvpForm>) } : null;
  } catch {
    return null;
  }
}

function validate(f: RsvpForm): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Please enter a valid email address.";
  if (!f.attending) e.attending = "Please let us know if you can make it.";
  if (f.attending === "yes" && !f.meal) e.meal = "Please choose a meal.";
  return e;
}

const inputCls = (invalid?: boolean) =>
  cn(
    "w-full rounded-xl border bg-paper/50 px-4 py-3 font-sans text-[15px] text-ink outline-none transition placeholder:text-ink/35 focus:border-gold-500 focus:bg-ivory focus:ring-4 focus:ring-gold-300/30",
    invalid ? "border-[#c9826f]" : "border-gold-300/70",
  );

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="font-sans text-[11px] font-medium tracking-[0.26em] text-sage-700 uppercase">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block font-sans text-xs text-[#b0533f]">{error}</span>}
    </label>
  );
}

export function Rsvp() {
  const [saved, setSaved] = useState<RsvpForm | null>(loadSaved);
  const [form, setForm] = useState<RsvpForm>(() => saved ?? EMPTY);
  const [editing, setEditing] = useState(() => saved === null);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const set = <K extends keyof RsvpForm>(key: K, value: RsvpForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSending(true);
    window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch {
        /* private mode — keep it in memory */
      }
      setSaved(form);
      setEditing(false);
      setSending(false);
      if (form.attending === "yes") celebrate();
    }, 900);
  };

  const firstName = saved?.name.trim().split(/\s+/)[0] ?? "";

  return (
    <section id="rsvp" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="RSVP"
        title="Will you join us?"
        subtitle={
          <>
            Kindly reply by <span className="font-medium text-ink">{wedding.rsvpBy}</span> - we can't wait to
            celebrate with you.
          </>
        }
      />

      <Reveal className="mx-auto mt-14 max-w-5xl">
        <div className="grid overflow-hidden rounded-[30px] bg-ivory shadow-[0_40px_80px_-50px_rgba(80,60,30,0.7)] ring-1 ring-gold-300/50 md:grid-cols-[0.85fr_1.15fr]">
          {/* Photo panel */}
          <div className="relative hidden min-h-[560px] md:block">
            <img
              src={wedding.images.rsvp}
              alt={`${wedding.partnerOne} and ${wedding.partnerTwo} holding hands in a field`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-deep/90 via-ink-deep/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-ivory">
              <p className="font-script text-5xl text-gold-300">With love,</p>
              <p className="mt-1 font-serif text-2xl">
                {wedding.partnerOne} &amp; {wedding.partnerTwo}
              </p>
              <a
                href={`mailto:${wedding.contactEmail}`}
                className="mt-5 inline-flex items-center gap-2 font-sans text-sm text-ivory/80 transition hover:text-ivory"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {wedding.contactEmail}
              </a>
            </div>
          </div>

          {/* Form / thank-you */}
          <div className="p-6 sm:p-12">
            {saved && !editing ? (
              <div className="fade-in flex h-full flex-col items-center justify-center py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-200/60 text-gold-600 ring-1 ring-gold-300">
                  {saved.attending === "yes" ? (
                    <PartyPopper className="h-7 w-7" aria-hidden="true" />
                  ) : (
                    <Heart className="h-7 w-7" aria-hidden="true" />
                  )}
                </span>
                <h3 className="mt-6 font-serif text-4xl font-medium text-ink">Thank you, {firstName}!</h3>
                <p className="mt-3 max-w-sm font-sans text-[15px] leading-relaxed font-light text-ink/75">
                  {saved.attending === "yes"
                    ? `We're so happy you'll be there! We've noted ${saved.guests} ${
                        saved.guests === "1" ? "seat" : "seats"
                      } and ${saved.meal.toLowerCase()}.`
                    : "We'll miss you dearly, and we'll keep you close in our thoughts."}
                </p>
                <p className="mt-2 font-sans text-xs text-ink/50">
                  The formal invitation will be sent to {saved.email}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm(saved);
                    setEditing(true);
                  }}
                  className="mt-8 font-sans text-xs tracking-[0.18em] text-sage-700 uppercase underline decoration-gold-400 underline-offset-4 transition hover:text-ink"
                >
                  Change my response
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name}>
                    <input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inputCls(!!errors.name)}
                      placeholder="Your name(s)"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls(!!errors.email)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </Field>
                </div>

                <fieldset>
                  <legend className="font-sans text-[11px] font-medium tracking-[0.26em] text-sage-700 uppercase">
                    Will you attend?
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Will you attend?">
                    {(
                      [
                        { value: "yes", title: "Joyfully accepts", sub: "Wouldn't miss it" },
                        { value: "no", title: "Regretfully declines", sub: "Celebrating from afar" },
                      ] as const
                    ).map((opt) => {
                      const active = form.attending === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => set("attending", opt.value)}
                          className={cn(
                            "rounded-2xl px-3 py-4 text-center ring-1 transition duration-300",
                            active
                              ? "bg-ink text-ivory shadow-[0_14px_28px_-16px_rgba(47,62,52,0.9)] ring-ink"
                              : "bg-paper/60 text-ink ring-gold-300/70 hover:ring-gold-500",
                            errors.attending && !active && "ring-[#c9826f]",
                          )}
                        >
                          <span className="block font-serif text-lg leading-tight sm:text-xl">{opt.title}</span>
                          <span
                            className={cn(
                              "mt-1 block font-sans text-[11px]",
                              active ? "text-ivory/70" : "text-ink/50",
                            )}
                          >
                            {opt.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.attending && (
                    <p className="mt-1.5 font-sans text-xs text-[#b0533f]">{errors.attending}</p>
                  )}
                </fieldset>

                {form.attending === "yes" && (
                  <div className="fade-in grid gap-6 sm:grid-cols-2">
                    <Field label="Guests (incl. you)">
                      <select
                        value={form.guests}
                        onChange={(e) => set("guests", e.target.value)}
                        className={inputCls()}
                      >
                        {["1", "2", "3", "4"].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Meal preference" error={errors.meal}>
                      <select
                        value={form.meal}
                        onChange={(e) => set("meal", e.target.value)}
                        className={inputCls(!!errors.meal)}
                      >
                        <option value="">Choose a meal…</option>
                        {MEALS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Dietary requirements" className="sm:col-span-2">
                      <input
                        value={form.dietary}
                        onChange={(e) => set("dietary", e.target.value)}
                        className={inputCls()}
                        placeholder="Allergies, intolerances…"
                      />
                    </Field>
                    <Field label="A song that gets you dancing" className="sm:col-span-2">
                      <input
                        value={form.song}
                        onChange={(e) => set("song", e.target.value)}
                        className={inputCls()}
                        placeholder="e.g. Munbe Vaa - A. R. Rahman"
                      />
                    </Field>
                  </div>
                )}

                <Field label="A note for the couple">
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className={cn(inputCls(), "resize-none")}
                    placeholder="Share a wish, a memory or a little advice…"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-6 py-4 font-sans text-sm tracking-[0.2em] text-ivory uppercase shadow-[0_16px_30px_-16px_rgba(47,62,52,0.9)] transition hover:-translate-y-0.5 hover:bg-ink-deep disabled:translate-y-0 disabled:opacity-70"
                >
                  {sending && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/30 border-t-ivory"
                      aria-hidden="true"
                    />
                  )}
                  {sending ? "Sending…" : "Send RSVP"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
