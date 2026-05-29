import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  submitLead,
  generateFreeArticle,
  sendArticleEmail,
  attachArticleToLead,
  detectCms,
  publishToWordPress,
  articleToHtml,
  type GeneratedArticle,
  type CmsDetection,
} from "@/lib/analyzer.functions";
import electricianHero from "@/assets/electrician-hero.jpg";

export const Route = createFileRoute("/electricians-2")({
  head: () => ({
    meta: [
      { title: "Get Found & Recommended by ChatGPT, Google — Electrician SEO" },
      {
        name: "description",
        content:
          "Free 4-minute scan. See exactly how your electrical business shows up on Google, Bing, ChatGPT, Gemini & Perplexity — and the 30-day plan to fix it.",
      },
      { property: "og:title", content: "Electrician SEO — Vector.SEO" },
      {
        property: "og:description",
        content:
          "Get found & recommended by ChatGPT, Perplexity AND Google. Built for electrical contractors.",
      },
      { property: "og:image", content: electricianHero },
    ],
  }),
  component: ElectriciansFunnel,
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types & helpers                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

type FunnelData = {
  url: string;
  domain: string;
  brand: string;
  city: string;
  description: string;
  services: string[];
  notServices: string[];
  priority: string;
  competitors: { domain: string; rd: number; da: number }[];
  yourRd: number;
  answers: Record<string, string>;
  email: string;
  name: string;
};

function extractDomain(input: string): string {
  const t = input
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");
  return t.split("/")[0] || t;
}

function brandFromDomain(d: string): string {
  const root = d.split(".")[0] || d;
  return root
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const DEFAULT_SERVICES = [
  "Panel Upgrades",
  "EV Charger Installation",
  "Emergency Electrical Repair",
  "Whole-Home Rewiring",
  "Lighting Installation",
  "Generator Installation",
  "Smoke Detector Install",
  "Ceiling Fan Installation",
];

const DEFAULT_NOT = ["HVAC Repair", "Plumbing", "Solar Panel Sales"];

const QUESTIONS: { id: string; q: string; options: string[] }[] = [
  {
    id: "chatgpt",
    q: "Does your business get traffic or mentions from ChatGPT?",
    options: ["Yes, a lot", "Yes, but not much", "I'm not tracking", "No", "I don't know"],
  },
  {
    id: "google",
    q: "How are you ranking on Google for your top service + city?",
    options: ["Top 3", "Page 1", "Page 2", "Not found", "I don't know"],
  },
  {
    id: "reviews",
    q: "How many Google reviews does your business profile have?",
    options: ["100+", "25–99", "Under 25", "None yet", "Not sure"],
  },
  {
    id: "leadflow",
    q: "Where do most of your jobs come from today?",
    options: ["Word of mouth", "Google Ads", "Angi / HomeAdvisor", "Organic search", "It varies"],
  },
  {
    id: "goal",
    q: "What's the #1 goal for the next 90 days?",
    options: [
      "More residential calls",
      "More commercial bids",
      "Hire more techs",
      "Replace lead gen platforms",
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Root                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function ElectriciansFunnel() {
  const [step, setStep] = useState(0); // 0 = hero, 1..5 = funnel steps
  const [data, setData] = useState<FunnelData>({
    url: "",
    domain: "",
    brand: "",
    city: "",
    description: "",
    services: DEFAULT_SERVICES.slice(0, 6),
    notServices: DEFAULT_NOT,
    priority: DEFAULT_SERVICES[0],
    competitors: [],
    yourRd: 0,
    answers: {},
    email: "",
    name: "",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 text-foreground">
      <TopNav />
      {step === 0 ? (
        <>
          <Hero
            onStart={(url) => {
              const domain = extractDomain(url);
              setData((d) => ({
                ...d,
                url,
                domain,
                brand: brandFromDomain(domain),
                description: `${brandFromDomain(domain)} is a licensed electrical contractor serving homeowners and businesses with panel upgrades, EV charger installation, rewiring, lighting, and 24/7 emergency electrical repair.`,
              }));
              setStep(1);
            }}
          />
          <SocialProof />
        </>
      ) : (
        <Funnel step={step} setStep={setStep} data={data} setData={setData} />
      )}
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Header & Hero                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function TopNav() {
  return (
    <header className="border-b border-border/40 bg-background/70 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground font-bold">
            V
          </div>
          <span className="font-semibold tracking-tight">
            Vector.SEO <span className="text-muted-foreground font-normal">· Electricians</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Rank in 30 days, guaranteed
          </span>
        </nav>
      </div>
    </header>
  );
}

function Hero({ onStart }: { onStart: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = url.trim();
    if (!cleaned || !cleaned.includes(".")) {
      setErr("Please enter a valid website URL");
      return;
    }
    onStart(cleaned);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.15),transparent_50%)]" />
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            For electrical contractors · No credit card needed
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Get found & recommended by <span className="text-emerald-500">ChatGPT</span>,{" "}
            <span className="text-emerald-500">Perplexity</span> AND{" "}
            <span className="text-emerald-500">Google</span>
          </h1>
          <ul className="mt-6 space-y-2 text-base text-muted-foreground">
            <li>🔍 Free 60-second scan across Google, Bing, ChatGPT, Gemini & Perplexity.</li>
            <li>
              📝 Plus{" "}
              <span className="text-foreground font-semibold">
                1 free, fully-written SEO article
              </span>{" "}
              by Vector AI — custom to your business, your city, your services.
            </li>
            <li>🔌 Built specifically for licensed electrical contractors.</li>
          </ul>

          <form
            onSubmit={submit}
            className="mt-8 rounded-2xl border-2 border-primary/40 bg-card p-2 shadow-[0_0_0_6px_hsl(var(--primary)/0.06)]"
          >
            <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40">
              <span className="text-muted-foreground text-sm mr-2 font-mono">https://</span>
              <input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setErr(null);
                }}
                placeholder="your-electrical-company.com"
                className="flex-1 bg-transparent outline-none text-base py-2"
                autoFocus
              />
            </div>
            {err && <p className="px-3 pt-2 text-sm text-destructive">{err}</p>}
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-4 hover:opacity-95 transition shadow-lg shadow-primary/20"
            >
              Scan My Site + Get 1 Free Article →
            </button>
          </form>

          <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <Stat label="Businesses supported" value="5,000+" />
            <Stat label="Rated on Trustpilot" value="4★" />
            <Stat label="Free · takes" value="4 min" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            By Acadium — trusted by 5,000+ businesses and rated 4★ across 500+ Trustpilot reviews.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl">
            <img
              src={electricianHero}
              alt="Licensed electrician"
              className="w-full h-full object-cover aspect-[4/5]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/0" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-card/90 backdrop-blur p-4 border border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Powered by Acadium
              </p>
              <p className="mt-1 text-2xl font-bold">5,000+ businesses</p>
              <p className="text-xs text-muted-foreground">
                have grown with Acadium's marketing programs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Social proof — real Acadium reviews                                       */
/* ────────────────────────────────────────────────────────────────────────── */

// Real customer reviews of Acadium (Vector.SEO's parent company). Quotes are
// kept short and lightly condensed; full reviews are public on Trustpilot:
// https://www.trustpilot.com/review/www.acadium.com
const REVIEWS: { quote: string; name: string; role: string }[] = [
  {
    quote:
      "An absolute game-changer for my business. Low-cost but high-impact — I'd recommend it to any small business on a budget.",
    name: "Verified business owner",
    role: "Trustpilot review",
  },
  {
    quote:
      "A proven source of talent to help our founders manage the many tasks required to grow a successful brand.",
    name: "Startup founder",
    role: "Acadium for Business",
  },
  {
    quote:
      "An excellent avenue for finding quality help. The system matches us with up-and-coming marketers — easy to use and quality results.",
    name: "Verified business owner",
    role: "Trustpilot review",
  },
];

function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="rounded-3xl border border-border bg-card/50 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Trusted by 5,000+ businesses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vector.SEO is built by Acadium — rated{" "}
              <span className="font-semibold text-foreground">4★</span> across 500+ Trustpilot
              reviews.
            </p>
          </div>
          <a
            href="https://www.trustpilot.com/review/www.acadium.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition self-start"
          >
            <span className="text-emerald-500">★★★★</span>
            <span className="text-muted-foreground">See reviews →</span>
          </a>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {REVIEWS.map((r, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-border bg-background p-5 flex flex-col"
            >
              <div className="text-emerald-500 text-sm" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground flex-1">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{r.name}</span> · {r.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Funnel shell                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function Funnel({
  step,
  setStep,
  data,
  setData,
}: {
  step: number;
  setStep: (n: number) => void;
  data: FunnelData;
  setData: React.Dispatch<React.SetStateAction<FunnelData>>;
}) {
  const titles = [
    "Site Scan",
    "Business Analysis",
    "How We Rank You",
    "Your Competitors",
    "Get Your Free Article & Choose A Package Below",
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="text-center text-2xl md:text-3xl font-bold mb-6">{titles[step - 1]}</h2>
      <Stepper current={step} total={5} />
      <div className="mt-8">
        {step === 1 && <Step1Scan data={data} onDone={() => setStep(2)} />}
        {step === 2 && <Step2Business data={data} setData={setData} onNext={() => setStep(3)} />}
        {step === 3 && <Step3Process onNext={() => setStep(4)} />}
        {step === 4 && <Step4Competitors data={data} setData={setData} onNext={() => setStep(5)} />}
        {step === 5 && <Step5Account data={data} setData={setData} />}
      </div>

      {step > 1 && step < 6 && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition"
            >
              ← Back
            </button>
            <span className="text-xs text-muted-foreground">
              Step {step} of 5: {titles[step - 1]}
            </span>
            <div className="w-[88px]" />
          </div>
        </div>
      )}
      <div className="h-20" />
    </section>
  );
}

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div
              className={`h-9 w-9 rounded-full grid place-items-center text-sm font-semibold transition ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? "✓" : n}
            </div>
            {n < total && (
              <div
                className={`h-0.5 w-10 md:w-16 ${n < current ? "bg-emerald-500" : "bg-muted"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Step 1 — Scanning animation                                              */
/* ────────────────────────────────────────────────────────────────────────── */

function Step1Scan({ data, onDone }: { data: FunnelData; onDone: () => void }) {
  const steps = [
    "Crawling homepage & sitemap…",
    "Identifying services & service area…",
    "Checking Google Business Profile…",
    "Probing ChatGPT, Perplexity & Gemini…",
    "Auditing schema, reviews & backlinks…",
    "Compiling 30-day growth plan…",
  ];
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(8);

  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => Math.min(100, p + 4 + Math.random() * 6));
    }, 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (pct >= 100) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const targetStep = Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length));
    setIdx(targetStep);
  }, [pct, onDone, steps.length]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
        <p className="text-sm">
          Scanning <span className="font-semibold">{data.domain}</span>…
        </p>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500 transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{steps[idx]}</p>

      <ul className="mt-6 space-y-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span
              className={`h-5 w-5 rounded-full grid place-items-center text-[10px] ${
                i < idx
                  ? "bg-emerald-500 text-white"
                  : i === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < idx ? "✓" : i + 1}
            </span>
            <span className={i <= idx ? "text-foreground" : "text-muted-foreground"}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Step 2 — Business info + questions                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function Step2Business({
  data,
  setData,
  onNext,
}: {
  data: FunnelData;
  setData: React.Dispatch<React.SetStateAction<FunnelData>>;
  onNext: () => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const totalQ = QUESTIONS.length;
  const currentQ = QUESTIONS[qIdx];
  const inQuestions = qIdx < totalQ;

  // Keep the "rank first" priority pointing at a service that still exists.
  // If the user deletes/renames the chosen service, fall back to the first one.
  useEffect(() => {
    if (data.services.length && !data.services.includes(data.priority)) {
      setData((d) => ({ ...d, priority: d.services[0] }));
    }
  }, [data.services, data.priority, setData]);

  const pick = (val: string) => {
    setData((d) => ({ ...d, answers: { ...d.answers, [currentQ.id]: val } }));
    if (qIdx < totalQ - 1) setQIdx(qIdx + 1);
    else setQIdx(totalQ);
  };

  if (inQuestions) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <p className="text-xs text-muted-foreground text-center">
          {qIdx + 1} / {totalQ}
        </p>
        <h3 className="mt-2 text-xl md:text-2xl font-semibold text-center">{currentQ.q}</h3>
        <div className="mt-6 space-y-2">
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5 ${
                data.answers[currentQ.id] === opt ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold">Your Business Information</h3>
        <p className="text-sm text-muted-foreground">We use this to tailor your 30-day plan.</p>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <Field label="Brand Name">
            <input
              value={data.brand}
              onChange={(e) => setData((d) => ({ ...d, brand: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <span className="inline-flex mt-1 text-xs text-emerald-600 font-medium">
              ✓ Compatible with Vector.SEO
            </span>
          </Field>
          <Field label="Primary Service City">
            <input
              value={data.city}
              onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))}
              placeholder="e.g. Phoenix, AZ"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <Field label="Business Description" className="mt-4">
          <textarea
            value={data.description}
            onChange={(e) => setData((d) => ({ ...d, description: e.target.value.slice(0, 1000) }))}
            maxLength={1000}
            rows={4}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <p className="text-right text-xs text-muted-foreground">{data.description.length}/1000</p>
        </Field>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="flex items-center gap-3">
          <span className="h-7 w-7 rounded-md bg-emerald-500 grid place-items-center text-white">
            ✓
          </span>
          <h3 className="font-semibold">Services You Offer</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Most important first — we focus content on these.
        </p>
        <ServiceList
          items={data.services}
          onChange={(items) => setData((d) => ({ ...d, services: items }))}
          accent="emerald"
        />
      </div>

      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6">
        <div className="flex items-center gap-3">
          <span className="h-7 w-7 rounded-md bg-rose-500 grid place-items-center text-white">
            ✕
          </span>
          <h3 className="font-semibold">Services You Don't Offer</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Helps us avoid writing content that wastes leads.
        </p>
        <ServiceList
          items={data.notServices}
          onChange={(items) => setData((d) => ({ ...d, notServices: items }))}
          accent="rose"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold">Which service should we rank first?</h3>
        <p className="text-sm text-muted-foreground">
          Pick your highest-margin or most-wanted job.
        </p>
        <div className="mt-4 space-y-2">
          {data.services.map((s, i) => (
            <button
              key={s}
              onClick={() => setData((d) => ({ ...d, priority: s }))}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                data.priority === s
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-border hover:border-primary"
              }`}
            >
              <span
                className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold ${
                  data.priority === s
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className="font-medium">{s}</span>
              {data.priority === s && (
                <span className="ml-auto text-xs text-emerald-600 font-semibold">
                  Highest priority
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          if (!data.city.trim()) {
            alert(
              "Please enter your primary service city so we can localize your article and plan.",
            );
            return;
          }
          if (!data.services.filter((s) => s.trim()).length) {
            alert("Please add at least one service you offer.");
            return;
          }
          onNext();
        }}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-4 hover:opacity-95 transition shadow-lg shadow-primary/20"
      >
        Next Step →
      </button>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}

function ServiceList({
  items,
  onChange,
  accent,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  accent: "emerald" | "rose";
}) {
  const [draft, setDraft] = useState("");
  const accentBtn =
    accent === "emerald" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600";

  return (
    <div className="mt-4 space-y-2">
      {items.map((item, i) => (
        <div
          key={item + i}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
        >
          <span className="text-muted-foreground text-xs">{i + 1}.</span>
          <input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-muted-foreground hover:text-destructive text-sm"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add another…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, draft.trim()]);
            setDraft("");
          }}
          className={`rounded-lg px-3 py-2 text-sm text-white ${accentBtn}`}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Step 3 — Process                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

function Step3Process({ onNext }: { onNext: () => void }) {
  const items = [
    {
      n: 1,
      title: "Deep Research on YOUR Service Area",
      body: "Our AI maps every electrical query homeowners in your city actually search — and what your competitors rank for.",
      tip: "Example: We discover people search 'why does my breaker keep tripping' — not just 'electrician near me'.",
      bullet: "Analyzes 500+ local + AI search terms",
    },
    {
      n: 2,
      title: "Publish 1 Expert Electrical Article Daily",
      body: "1,500–2,500 word, schema-rich articles written for both Google AND ChatGPT/Perplexity retrieval.",
      tip: "Each article cites code (NEC), permits and real safety data — what AI engines reward.",
      bullet: "30 expert articles per month",
    },
    {
      n: 3,
      title: "Build 100 DA of Trust Links (Autopilot)",
      body: "Other trusted sites mention and link to your articles. Each link tells Google + AI: 'this electrician is legit.'",
      tip: "Every link is from a real small-business site, Moz-verified, spam-checked.",
      bullet: "Set minimum DA · Remove any link anytime",
    },
    {
      n: 4,
      title: "Watch Booked Jobs Roll In",
      body: "ChatGPT recommends you. Google ranks you higher. More homeowners call — without ads.",
      tip: "More booked calls = $0 ad spend.",
      bullet: "Compounding organic visibility — no ad spend",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h3 className="text-center text-xl md:text-2xl font-semibold">
        Here's How We Rank Your Electrical Business
      </h3>
      <div className="mt-6 space-y-4">
        {items.map((it) => (
          <div key={it.n} className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-start gap-4">
              <div className="h-9 w-9 rounded-full bg-foreground text-background grid place-items-center font-bold shrink-0">
                {it.n}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{it.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
                <div className="mt-3 rounded-lg border-l-2 border-emerald-500 bg-emerald-500/5 px-3 py-2 text-xs">
                  {it.tip}
                </div>
                <p className="mt-2 text-xs text-emerald-600 font-medium">✓ {it.bullet}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm">
        <span className="h-5 w-5 rounded-full bg-emerald-500 grid place-items-center text-white text-[10px]">
          ✓
        </span>
        <span>
          <strong>Everything happens automatically</strong> — you just review and approve.
        </span>
      </div>
      <button
        onClick={onNext}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-4 hover:opacity-95 transition shadow-lg shadow-primary/20"
      >
        Continue Setup →
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Step 4 — Competitors                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function Step4Competitors({
  data,
  setData,
  onNext,
}: {
  data: FunnelData;
  setData: React.Dispatch<React.SetStateAction<FunnelData>>;
  onNext: () => void;
}) {
  // Generate a plausible competitor set ONCE (seeded off city/domain) and persist
  // it into funnel state. Doing this in an effect — never during render — avoids
  // the "setState during render" anti-pattern and keeps numbers stable.
  useEffect(() => {
    if (data.competitors.length) return;
    const citySlug = (data.city || "city").toLowerCase().split(",")[0].replace(/\s+/g, "");
    const seeds = [
      `mr-electric-${citySlug}.com`,
      `${citySlug}-electricpros.com`,
      `bolt-electric.com`,
      `${citySlug}poweredup.com`,
      `nationalelectricaldirectory.com`,
    ];
    const out = seeds.map((d, i) => ({
      domain: d,
      rd: Math.round(500 + Math.random() * 4500 + i * 320),
      da: 28 + Math.round(Math.random() * 35),
    }));
    setData((s) =>
      s.competitors.length
        ? s
        : { ...s, competitors: out, yourRd: Math.max(8, Math.round(Math.random() * 60)) },
    );
  }, [data.city, data.competitors.length, setData]);

  const competitors = data.competitors;
  // yourRd is computed once and stored in state so it doesn't flicker on every
  // keystroke in the "add competitor" box.
  const yourRd = data.yourRd || 0;
  const median = competitors.length
    ? Math.round(competitors.reduce((a, b) => a + b.rd, 0) / competitors.length)
    : 0;
  const gap = Math.max(0, median - yourRd);
  const [newDom, setNewDom] = useState("");

  // Don't render the table until the seeded competitor set exists.
  if (!competitors.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Loading competitor analysis…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground">
          👥
        </div>
        <h3 className="mt-3 text-xl md:text-2xl font-semibold">
          Your Competitors (and their authority)
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          We found these electricians ranking in your market. Here's how their backlinks compare.
        </p>
        <span className="inline-flex mt-3 rounded-full bg-rose-500/10 text-rose-600 px-3 py-1 text-xs font-semibold">
          Behind competitor median by {gap.toLocaleString()} domains
        </span>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <KPI label="Your referring domains" value={yourRd.toLocaleString()} tone="primary" />
        <KPI label="Competitor median" value={median.toLocaleString()} tone="default" />
        <KPI
          label="Current gap"
          value={gap > 0 ? `−${gap.toLocaleString()}` : "Closed"}
          tone="rose"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">#</th>
              <th className="text-left px-4 py-2 font-medium">Domain</th>
              <th className="text-right px-4 py-2 font-medium">Referring Domains</th>
              <th className="text-right px-4 py-2 font-medium">DA</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr className="bg-primary/5">
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3 flex items-center gap-2">
                <span className="font-semibold">{data.domain}</span>
                <span className="rounded bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                  YOU
                </span>
              </td>
              <td className="px-4 py-3 text-right">{yourRd.toLocaleString()}</td>
              <td className="px-4 py-3 text-right">{Math.max(5, Math.round(yourRd / 4))}</td>
              <td />
            </tr>
            {competitors.map((c, i) => (
              <tr key={c.domain} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">{i + 2}</td>
                <td className="px-4 py-3">{c.domain}</td>
                <td className="px-4 py-3 text-right">{c.rd.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{c.da}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() =>
                      setData((s) => ({
                        ...s,
                        competitors: s.competitors.filter((x) => x.domain !== c.domain),
                      }))
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-background p-4">
        <p className="text-sm font-semibold">Add a Competitor</p>
        <div className="mt-2 flex gap-2">
          <input
            value={newDom}
            onChange={(e) => setNewDom(e.target.value)}
            placeholder="competitor-electric.com"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              const d = extractDomain(newDom);
              if (!d.includes(".")) return;
              setData((s) => ({
                ...s,
                competitors: [
                  ...s.competitors,
                  {
                    domain: d,
                    rd: 1000 + Math.round(Math.random() * 3000),
                    da: 30 + Math.round(Math.random() * 30),
                  },
                ],
              }));
              setNewDom("");
            }}
            className="rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Root domains only (no subdomains).</p>
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-4 hover:opacity-95 transition shadow-lg shadow-primary/20"
      >
        Next Step →
      </button>
    </div>
  );
}

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "default" | "rose";
}) {
  const toneCls =
    tone === "primary"
      ? "border-primary/30 bg-primary/5"
      : tone === "rose"
        ? "border-rose-500/30 bg-rose-500/5"
        : "border-border bg-background";
  return (
    <div className={`rounded-xl border ${toneCls} p-4`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Step 5 — Account / Lead capture                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function Step5Account({
  data,
  setData,
}: {
  data: FunnelData;
  setData: React.Dispatch<React.SetStateAction<FunnelData>>;
}) {
  const submit = useServerFn(submitLead);
  const generate = useServerFn(generateFreeArticle);
  const sendEmail = useServerFn(sendArticleEmail);
  const attachArticle = useServerFn(attachArticleToLead);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"form" | "generating" | "done">("form");
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setErr("Please agree to the terms.");
      return;
    }
    setBusy(true);
    setErr(null);

    // Built once and reused for the DB row + the email notification.
    const snapshot = {
      funnel: "electricians-2",
      domain: data.domain,
      brand: data.brand,
      city: data.city,
      description: data.description,
      services: data.services,
      notServices: data.notServices,
      priority: data.priority,
      answers: data.answers,
      competitors: data.competitors,
    };

    try {
      const res = await submit({
        data: {
          name: data.name || data.brand || "Unknown",
          email: data.email,
          target: `${data.priority} — ${data.city || "Local"} | ${data.domain}`,
          snapshot,
        },
      });
      if (!res?.ok) {
        setErr(res?.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      const leadId = "leadId" in res ? res.leadId : null;

      setPhase("generating");
      // Client-side safety net: if the server call never resolves (network drop,
      // function killed), don't let the UI hang on "Finalizing…" forever. Race
      // the generation against a timeout slightly longer than the server's own.
      const generatePromise = generate({
        data: {
          brand: data.brand,
          domain: data.domain,
          city: data.city,
          sector: "licensed electrical contractor",
          services: data.services,
          priorityKeyword: data.priority + (data.city ? ` ${data.city}` : ""),
        },
      });
      const art = await Promise.race([
        generatePromise,
        new Promise<{ ok: false; error: string }>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: false,
                error:
                  "This is taking longer than expected. Your details are saved — we'll email your article shortly.",
              }),
            65000,
          ),
        ),
      ]);
      if (art.ok) {
        setArticle(art.article);
        setPhase("done");

        // Persist the generated article onto the lead row (best-effort).
        if (leadId) {
          try {
            await attachArticle({ data: { leadId, article: art.article } });
          } catch {
            /* non-blocking */
          }
        }

        // Email the article to the lead + full lead/article to the team.
        try {
          const mail = await sendEmail({
            data: {
              toEmail: data.email,
              name: data.name,
              brand: data.brand,
              domain: data.domain,
              snapshot,
              article: art.article,
            },
          });
          setEmailSent(!!mail?.ok);
        } catch {
          setEmailSent(false);
        }
      } else {
        setErr(art.error || "We couldn't generate your article just now. Please try again.");
        setPhase("done");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "generating") return <ArticleGeneratingAnimation brand={data.brand} />;
  if (phase === "done")
    return (
      <ArticleView
        article={article}
        brand={data.brand}
        domain={data.domain}
        email={data.email}
        emailSent={emailSent}
        error={err}
      />
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5"
    >
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-semibold">Almost done — claim your free article</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vector AI will write a comprehensive, ready-to-publish SEO article for{" "}
          <span className="font-semibold text-foreground">{data.brand}</span>. We'll show it on the
          next screen and email a copy.
        </p>
      </div>

      <Field label="Your Name">
        <input
          value={data.name}
          onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Email Address">
        <input
          value={data.email}
          onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
          type="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1"
        />
        <span className="text-muted-foreground">
          I agree to the{" "}
          <a className="text-primary underline" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="text-primary underline" href="#">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-4 hover:opacity-95 transition shadow-lg shadow-primary/20 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Generate My Free Article →"}
      </button>

      <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
        ✨ <strong className="text-foreground">Written by Vector AI.</strong> A 1,800–2,400 word
        pillar article custom-built for your business, services and city.
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Article generating animation                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function ArticleGeneratingAnimation({ brand }: { brand: string }) {
  const steps = [
    "Briefing Vector AI on your business…",
    "Researching your sector & local market…",
    "Drafting key takeaways & table of contents…",
    "Writing H2 sections with expert depth…",
    "Adding People-Also-Ask FAQs…",
    "Finalizing your custom article…",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => Math.min(steps.length - 1, i + 1)), 4500);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground text-2xl animate-pulse">
        ✨
      </div>
      <h3 className="mt-4 text-2xl font-bold">Vector AI is writing your article for {brand}…</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        This usually takes 30–60 seconds. Don't close this tab.
      </p>
      <ul className="mt-6 space-y-2 max-w-md mx-auto text-left">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span
              className={`h-5 w-5 rounded-full grid place-items-center text-[10px] ${
                i < idx
                  ? "bg-emerald-500 text-white"
                  : i === idx
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < idx ? "✓" : i + 1}
            </span>
            <span className={i <= idx ? "text-foreground" : "text-muted-foreground"}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Rendered article (blog-style)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ArticleView({
  article,
  brand,
  domain,
  email,
  emailSent,
  error,
}: {
  article: GeneratedArticle | null;
  brand: string;
  domain: string;
  email: string;
  emailSent: boolean;
  error: string | null;
}) {
  if (!article) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500 grid place-items-center text-white text-2xl">
          ✓
        </div>
        <h3 className="mt-4 text-2xl font-bold">You're in.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks{brand ? `, ${brand}` : ""} — your details are saved.{" "}
          {emailSent ? (
            <>
              Your custom article is on its way to{" "}
              <span className="font-semibold text-foreground">{email}</span>.
            </>
          ) : (
            <>
              Our team will follow up at{" "}
              <span className="font-semibold text-foreground">{email}</span> shortly.
            </>
          )}
        </p>
        {error && <p className="mt-3 text-xs text-muted-foreground">{error}</p>}
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden">
      <PackagesModal />
      {/* Hero */}
      <div className="relative aspect-[16/8] bg-gradient-to-br from-primary/20 via-accent/10 to-emerald-500/20 grid place-items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.25),transparent_60%)]" />
        <h1 className="relative px-6 text-center text-2xl md:text-4xl font-bold tracking-tight max-w-3xl">
          {article.title}
        </h1>
      </div>

      <div className="px-6 md:px-10 py-8 md:py-10 space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">
            Custom for {brand}
          </span>
          <span>· {article.readTimeMinutes} min read</span>
          <span>· Written by Vector AI</span>
          <span>· Published on {domain}</span>
        </div>

        {/* Key Takeaways */}
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-lg font-semibold">Key Takeaways</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {article.keyTakeaways.map((k, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* TOC */}
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-lg font-semibold">Table of Contents</h2>
          <ol className="mt-3 space-y-1 text-sm list-decimal pl-5">
            {article.tableOfContents.map((t, i) => (
              <li key={i}>
                <a href={`#${slug(t)}`} className="text-primary hover:underline">
                  {t}
                </a>
              </li>
            ))}
          </ol>
        </section>

        {/* Sections */}
        {article.sections.map((s, i) => (
          <section key={i} id={slug(s.h2)} className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{s.h2}</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">{s.intro}</p>
            {s.subsections.map((ss, j) => (
              <div key={j} className="space-y-2">
                <h3 className="text-lg font-semibold">{ss.h3}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{ss.body}</p>
              </div>
            ))}
          </section>
        ))}

        {/* FAQs */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          {article.faqs.map((f, i) => (
            <details key={i} className="rounded-xl border border-border bg-background p-4 group">
              <summary className="cursor-pointer font-medium list-none flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-muted-foreground group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold">{article.cta.headline}</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">{article.cta.body}</p>
          <button className="mt-5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-6 py-3 shadow-lg shadow-primary/20">
            {article.cta.buttonText}
          </button>
        </section>

        {/* PUBLISH TO YOUR SITE */}
        <PublishPanel article={article} domain={domain} brand={brand} />

        {emailSent ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-center">
            ✅ A copy of this article has been sent to{" "}
            <span className="font-semibold">{email}</span>.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-center text-muted-foreground">
            💾 Your article is ready above. Use the publish options to get it live on your site.
          </div>
        )}

        {/* CHOOSE A PACKAGE */}
        <PackagesSection brand={brand} />
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Packages (placeholder pricing — wire up checkout later)                  */
/* ────────────────────────────────────────────────────────────────────────── */

const PACKAGES: {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    name: "Starter",
    price: "$297",
    cadence: "/mo",
    tagline: "Get found in your city.",
    features: [
      "4 SEO articles per month",
      "On-page optimization",
      "Google Business Profile tune-up",
      "Monthly ranking report",
    ],
  },
  {
    name: "Growth",
    price: "$597",
    cadence: "/mo",
    tagline: "Outrank local competitors.",
    features: [
      "12 SEO articles per month",
      "Everything in Starter",
      "Trust-link building (autopilot)",
      "AI search optimization (ChatGPT, Perplexity)",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Dominate",
    price: "$997",
    cadence: "/mo",
    tagline: "Own page one, everywhere.",
    features: [
      "30 SEO articles per month",
      "Everything in Growth",
      "Dedicated strategist",
      "Multi-location / multi-service coverage",
      "Guaranteed rankings in 30 days",
    ],
  },
];

function PackageCards({ onChoose }: { onChoose?: (name: string) => void }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {PACKAGES.map((p) => (
        <div
          key={p.name}
          className={`relative rounded-2xl border p-6 flex flex-col ${
            p.highlight
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-border bg-background"
          }`}
        >
          {p.highlight && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1">
              Most popular
            </span>
          )}
          <h3 className="font-bold text-lg">{p.name}</h3>
          <p className="text-sm text-muted-foreground">{p.tagline}</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{p.price}</span>
            <span className="text-sm text-muted-foreground">{p.cadence}</span>
          </div>
          <ul className="mt-5 space-y-2 text-sm flex-1">
            {p.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onChoose?.(p.name)}
            className={`mt-6 w-full rounded-xl font-semibold py-3 transition ${
              p.highlight
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 shadow-lg shadow-primary/20"
                : "border border-border hover:bg-muted"
            }`}
          >
            Choose {p.name}
          </button>
        </div>
      ))}
    </div>
  );
}

function PackagesSection({ brand }: { brand: string }) {
  return (
    <section className="pt-2">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Choose a package to get {brand || "your business"} ranking
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          You just saw what one free article looks like. Pick a plan and we'll do this every month —
          hands-off — until you own your local market.
        </p>
      </div>

      <div className="mt-8">
        <PackageCards />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Cancel anytime · No long-term contracts · 30-day ranking guarantee on Growth & Dominate.
      </p>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Scroll-triggered packages popup                                          */
/* ────────────────────────────────────────────────────────────────────────── */
// Appears once the visitor scrolls past ~50% of the page so the pricing isn't
// missed at the bottom. Shows once, is dismissible, and won't re-open after close.

function PackagesModal() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const half = document.documentElement.scrollHeight * 0.5;
      if (scrolled >= half) setOpen(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // handle short pages already past the halfway mark
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const close = () => {
    setOpen(false);
    setDismissed(true);
  };

  if (!open || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a package"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 h-8 w-8 grid place-items-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          ✕
        </button>

        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">
            Don't miss this
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
            Pick a plan and start ranking
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Your free article is just the start. Choose a package and we'll publish month after
            month until you own page one — on Google and in AI search.
          </p>
        </div>

        <div className="mt-6">
          <PackageCards onChoose={close} />
        </div>

        <button
          onClick={close}
          className="mt-5 mx-auto block text-xs text-muted-foreground hover:text-foreground underline"
        >
          No thanks, I'll keep reading
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Publish to your site                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function PublishPanel({
  article,
  domain,
  brand,
}: {
  article: GeneratedArticle;
  domain: string;
  brand: string;
}) {
  const detect = useServerFn(detectCms);
  const publishWp = useServerFn(publishToWordPress);

  const [cms, setCms] = useState<CmsDetection | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [detectErr, setDetectErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetecting(true);
    detect({ data: { url: domain } })
      .then((r) => {
        if (!cancelled) setCms(r);
      })
      .catch((e) => {
        if (!cancelled) setDetectErr(e instanceof Error ? e.message : "Detection failed.");
      })
      .finally(() => {
        if (!cancelled) setDetecting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  // WP form state
  const [wpUser, setWpUser] = useState("");
  const [wpPass, setWpPass] = useState("");
  const [wpStatus, setWpStatus] = useState<"draft" | "publish">("draft");
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<
    { ok: true; link: string; status: string } | { ok: false; error: string } | null
  >(null);

  const downloadHtml = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${article.title}</title><meta name="description" content="${article.metaDescription || ""}"></head><body>${articleToHtml(article)}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(articleToHtml(article));
    } catch {
      /* noop */
    }
  };

  const submitWp = async (e: FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await publishWp({
        data: {
          siteUrl: domain,
          username: wpUser.trim(),
          appPassword: wpPass,
          status: wpStatus,
          article,
        },
      });
      setPublishResult(res);
    } catch (err) {
      setPublishResult({
        ok: false,
        error: err instanceof Error ? err.message : "Publish failed.",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6 md:p-8 space-y-5">
      <header className="text-center">
        <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          Final Step
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold">
          Publish this article on your website
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We scanned <span className="font-mono text-foreground">{domain}</span> and figured out how
          to get this live on {brand}'s site.
        </p>
      </header>

      {/* Detection state */}
      <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-3 text-sm">
        {detecting ? (
          <>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">Detecting your CMS…</span>
          </>
        ) : cms ? (
          <>
            <span
              className={`h-2 w-2 rounded-full ${cms.publishMode === "native" ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            <span>
              <strong className="text-foreground">{cms.label}</strong> detected · confidence:{" "}
              {cms.confidence}
            </span>
            {cms.signals?.[0] && (
              <span className="ml-auto text-xs text-muted-foreground hidden md:inline">
                {cms.signals[0]}
              </span>
            )}
          </>
        ) : (
          <span className="text-destructive">{detectErr || "Couldn't detect CMS."}</span>
        )}
      </div>

      {/* Native: self-hosted WordPress */}
      {cms?.platform === "wordpress" && cms.publishMode === "native" && (
        <form
          onSubmit={submitWp}
          className="rounded-xl border border-border bg-background p-5 space-y-4"
        >
          <div>
            <h3 className="font-semibold">Connect WordPress &amp; publish in 1 click</h3>
            <p className="text-xs text-muted-foreground mt-1">
              We'll post via the official WordPress REST API. Generate an{" "}
              <strong>Application Password</strong> in WP Admin → Users → Profile → Application
              Passwords (takes 10 seconds and is safer than your real password).{" "}
              <a
                className="text-primary underline"
                href="https://wordpress.org/documentation/article/application-passwords/"
                target="_blank"
                rel="noreferrer"
              >
                How →
              </a>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm space-y-1">
              <span className="text-muted-foreground">WP Username (or email)</span>
              <input
                value={wpUser}
                onChange={(e) => setWpUser(e.target.value)}
                required
                placeholder="admin"
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="text-muted-foreground">Application Password</span>
              <input
                value={wpPass}
                onChange={(e) => setWpPass(e.target.value)}
                required
                type="password"
                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-mono"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <fieldset className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="wpstatus"
                  checked={wpStatus === "draft"}
                  onChange={() => setWpStatus("draft")}
                />
                Save as draft
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="wpstatus"
                  checked={wpStatus === "publish"}
                  onChange={() => setWpStatus("publish")}
                />
                Publish live
              </label>
            </fieldset>
            <button
              type="submit"
              disabled={publishing}
              className="ml-auto rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-5 py-2.5 shadow-md shadow-primary/20 disabled:opacity-60"
            >
              {publishing
                ? "Publishing…"
                : wpStatus === "publish"
                  ? "Publish to WordPress →"
                  : "Save Draft to WordPress →"}
            </button>
          </div>

          {publishResult && publishResult.ok && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
              ✅ {publishResult.status === "publish" ? "Published" : "Draft created"} successfully.{" "}
              <a
                className="text-primary underline"
                href={publishResult.link}
                target="_blank"
                rel="noreferrer"
              >
                View {publishResult.status === "publish" ? "post" : "draft"} →
              </a>
            </div>
          )}
          {publishResult && !publishResult.ok && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              ⚠️ {publishResult.error}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            🔒 Your password is sent over HTTPS to our server, used once to call{" "}
            <span className="font-mono">{cms.publishUrl}</span>, and never stored.
          </p>
        </form>
      )}

      {/* Manual: every other CMS (and unreachable WP) */}
      {cms && cms.publishMode === "manual" && (
        <div className="rounded-xl border border-border bg-background p-5 space-y-3">
          <h3 className="font-semibold">How to publish on {cms.label}</h3>
          <p className="text-sm text-muted-foreground">{cms.instructions}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={downloadHtml}
              className="rounded-lg bg-foreground text-background font-medium px-4 py-2 text-sm hover:opacity-90"
            >
              ⬇ Download as HTML
            </button>
            <button
              onClick={copyHtml}
              className="rounded-lg border border-border bg-card font-medium px-4 py-2 text-sm hover:bg-muted"
            >
              📋 Copy HTML to clipboard
            </button>
            <a
              href="mailto:?subject=Publish%20this%20article&body=See%20attached%20HTML%20file."
              className="rounded-lg border border-border bg-card font-medium px-4 py-2 text-sm hover:bg-muted"
            >
              ✉ Send to my developer
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Want us to set up 1-click publishing for {cms.label}? Reply to your welcome email and
            we'll add your site to the queue.
          </p>
        </div>
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Footer                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border/40 mt-16">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Vector.SEO · Built for electrical contractors.</p>
        <p>Rank in 30 days, guaranteed — or you don't pay.</p>
      </div>
    </footer>
  );
}
