import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import nicheHero from "@/assets/foundation-repair-hero.jpg";
import vectorBrainImg from "@/assets/vector-brain.jpg";

export const Route = createFileRoute("/foundation-repair")({
  head: () => ({
    meta: [
      { title: "SEO for Foundation Repair Specialists — Vector.SEO" },
      {
        name: "description",
        content:
          "Predictable, high-ticket foundation repair leads from Google, Bing, ChatGPT, Gemini, and Perplexity. Rank in 30 days, guaranteed.",
      },
      { property: "og:title", content: "SEO for Foundation Repair Specialists — Vector.SEO" },
      {
        property: "og:description",
        content:
          "Be the foundation repair specialist homeowners (and AI search engines) call when they spot the first crack. 15+ years of ranking experience.",
      },
      { property: "og:image", content: nicheHero },
    ],
  }),
  component: NichePage,
});

function NichePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <TrustBar />
      <Problem />
      <System />
      <Services />
      <Vector />
      <Process />
      <Proof />
      <Testimonials />
      <Pricing />
      <Guarantee />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* -------------------- Header -------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
            V
          </span>
          Vector<span className="text-muted-foreground">.SEO</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#system" className="hover:text-foreground">
            The System
          </a>
          <a href="#services" className="hover:text-foreground">
            Services
          </a>
          <a href="#proof" className="hover:text-foreground">
            Case Studies
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
        </nav>
        <a
          href="#consult"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          Free Strategy Call →
        </a>
      </div>
    </header>
  );
}

/* -------------------- Hero -------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Built for Foundation Repair
            Specialists
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Be the foundation expert{" "}
            <span className="bg-gradient-to-r from-accent to-foreground bg-clip-text text-transparent">
              homeowners (and AI) call when they spot the first crack
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            We rank foundation repair, basement waterproofing, and structural specialists across
            Google, Bing, ChatGPT, Gemini, and Perplexity — so the right high-ticket customer finds
            you when they're ready to spend $8K–$60K to save their home.
          </p>
          <p className="mt-3 font-mono text-sm font-semibold uppercase tracking-wider text-accent">
            Rank in 30 days. Guaranteed.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#consult"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:opacity-90"
            >
              Get My Free Foundation Repair SEO Audit →
            </a>
            <a
              href="#proof"
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground transition hover:bg-secondary"
            >
              See Case Studies
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>✓ No long contracts</span>
            <span>✓ Exclusive in your service area</span>
            <span>✓ 15+ years ranking structural contractors</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-accent/30 to-transparent blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
            <img
              src={nicheHero}
              alt="Foundation Repair Specialists hero"
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Avg. client result
            </div>
            <div className="mt-1 text-2xl font-bold">+312% inspections</div>
            <div className="text-xs text-muted-foreground">within 90 days</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Trust bar -------------------- */
function TrustBar() {
  const stats = [
    ["120+", "Foundation firms ranked"],
    ["15+ yrs", "Structural trade SEO"],
    ["98%", "Hit page-one in 30 days"],
    ["$74M", "Client revenue attributed"],
  ];
  return (
    <section className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4">
        {stats.map(([n, l]) => (
          <div key={l}>
            <div className="text-2xl font-bold tracking-tight md:text-3xl">{n}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------- Problem -------------------- */
function Problem() {
  const items = [
    {
      t: "A cracked wall is a 24-hour decision",
      d: "When a homeowner spots a vertical crack or a sticking door, they Google it that night. If you're not in the top 3, they book the inspection with whoever is.",
    },
    {
      t: "National chains and franchises crowd the SERP",
      d: "Olshan, Ram Jack, Groundworks brands — they spend six figures a month on SEO. Independent foundation firms get buried unless someone builds a smarter local + AEO play.",
    },
    {
      t: "ChatGPT and Gemini are the new diagnostic search",
      d: 'Homeowners panic-ask AI "is this foundation crack serious?" — and the engines name a company. If it\'s not you, you never even got the inspection.',
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            The Foundation Trap
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Foundation repair is a high-trust, high-ticket sale — and homeowners pick by who Google
            trusts most.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.t} className="rounded-xl border border-border bg-card p-6">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-destructive/10 text-destructive">
                ✕
              </div>
              <h3 className="mt-4 text-lg font-semibold">{i.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- System -------------------- */
function System() {
  return (
    <section id="system" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-accent">
              The Vector System
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Outrank the national franchises — and become the AI-recommended foundation expert in
              your market.
            </h2>
            <p className="mt-5 text-muted-foreground">
              We don't do generic SEO. We've built a system specifically for foundation repair and
              structural specialists that combines traditional Google rankings with AI Engine
              Optimization (AEO) — so you show up whether the homeowner is searching, diagnosing, or
              being recommended.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Rank for high-intent terms like 'foundation repair near me' and 'cracked foundation [city]'",
                "Get cited by ChatGPT, Gemini, and Perplexity when homeowners ask about cracks, settlement, and pier options",
                "Push national chains (Olshan, Ram Jack, Groundworks) below your listing in the Map Pack",
                "Convert nervous homeowners into paid inspections — and inspections into $8K–$60K repair contracts",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-xs text-accent">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <span>Live rank tracker</span>
                <span className="text-success">● live</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { k: "foundation repair houston", e: "Google", p: 1 },
                  { k: "cracked foundation wall", e: "Bing", p: 1 },
                  { k: "best foundation repair company near me", e: "ChatGPT", p: "cited" },
                  { k: "steel pier vs helical pier", e: "Gemini", p: "cited" },
                  { k: "basement waterproofing cost", e: "Perplexity", p: 2 },
                ].map((r) => (
                  <div
                    key={r.k}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  >
                    <div>
                      <div className="font-medium">{r.k}</div>
                      <div className="text-xs text-muted-foreground">{r.e}</div>
                    </div>
                    <div className="rounded-md bg-success/10 px-2.5 py-1 font-mono text-xs font-semibold text-success">
                      #{r.p}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Services -------------------- */
function Services() {
  const services = [
    {
      t: "Local SEO & Map Pack Domination",
      d: "Rank #1 in the Google Map Pack for every city, ZIP code, and neighborhood you serve — outranking Olshan, Ram Jack, and Groundworks brands.",
    },
    {
      t: "AI Engine Optimization",
      d: "Get cited by ChatGPT, Gemini, and Perplexity when homeowners ask about cracks, settlement, and which pier system to choose.",
    },
    {
      t: "Conversion-Optimized Website",
      d: "Free-inspection booking, financing displays, warranty trust badges, and engineer credentials that turn worried homeowners into scheduled inspections.",
    },
    {
      t: "Service & City Page Engine",
      d: "Dedicated pages for every service (steel piers, helical piers, basement waterproofing, crawl space encapsulation, wall anchors) × every city you serve.",
    },
    {
      t: "Engineer & Authority Content",
      d: "Diagnostic content that builds expertise signals and surfaces in research queries — turning Google into your top sales rep.",
    },
    {
      t: "High-Authority Link Building",
      d: "Editorial features in home, real estate, and structural-engineering publications that move the rankings needle for foundation keywords.",
    },
  ];
  return (
    <section id="services" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">What you get</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Everything foundation repair specialists need to own their market.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <div
              key={s.t}
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-accent/40 hover:shadow-elevated"
            >
              <div className="font-mono text-xs text-muted-foreground">0{i + 1}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Vector brain -------------------- */
function Vector() {
  return (
    <section className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border">
            <img
              src={vectorBrainImg}
              alt="Vector AI ranking engine"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-accent">
              Powered by Vector
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Our proprietary AI second-brain teaches search engines who you are.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Vector is our in-house AI system that models how Google's RankBrain, ChatGPT's
              retrieval, and Gemini's grounding actually choose who to recommend. It maps your
              foundation repair business as an entity — your engineering credentials, pier systems,
              warranties, response times, and reviews — into the same vector space the engines use
              to answer homeowner questions.
            </p>
            <p className="mt-3 text-muted-foreground">
              Translation: when someone asks "who repairs slab foundations in Sugar Land?" — your
              name is what comes back.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Process -------------------- */
function Process() {
  const steps = [
    {
      n: "01",
      t: "Free Audit & Strategy Call",
      d: "We analyze your visibility across all 5 engines and build a 90-day game plan.",
    },
    {
      n: "02",
      t: "Foundation Fix (Week 1–2)",
      d: "Technical SEO, schema, Google Business Profile, and on-page optimization.",
    },
    {
      n: "03",
      t: "Service Pages & Authority (Week 3–4)",
      d: "Service-area pages, emergency keywords, review velocity, and link building.",
    },
    {
      n: "04",
      t: "Rank & Scale (Day 30+)",
      d: "You hit page one. We expand to adjacent ZIPs, services, and AI engines.",
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">How it works</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            4 steps from invisible to fully booked.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-6">
              <div className="font-mono text-xs text-accent">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Proof -------------------- */
function Proof() {
  const cases = [
    {
      who: "Bedrock Foundation Solutions",
      where: "Houston, TX",
      kw: "foundation repair houston",
      before: "Page 3 (Google) · No AI citations",
      after: "#1 Google · #1 Map Pack · cited by ChatGPT, Gemini & Perplexity",
      result: "+162 paid inspections/month",
    },
    {
      who: "TerraFirm Structural",
      where: "Kansas City, MO",
      kw: "cracked foundation wall",
      before: "Outranked by Groundworks everywhere",
      after: "Above Groundworks in 12 of 15 cities",
      result: "$1.8M in new repair contracts in 7 months",
    },
    {
      who: "Coastline Basement & Foundation",
      where: "Raleigh, NC",
      kw: "basement waterproofing raleigh",
      before: "$18K/mo on Google Ads, 28 inspections/mo",
      after: "Cut ads 65% · 91 organic inspections/mo",
      result: "$140K saved annually on ad spend",
    },
  ];
  return (
    <section id="proof" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">Case studies</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Real foundation repair specialists. Real rankings. Real revenue.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.who} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.who}</div>
                  <div className="text-xs text-muted-foreground">{c.where}</div>
                </div>
                <div className="rounded-md bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
                  case study
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-border bg-background p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Target keyword
                </div>
                <div className="mt-1 font-mono text-sm">{c.kw}</div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Before
                  </div>
                  <div className="mt-0.5 text-destructive">{c.before}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    After
                  </div>
                  <div className="mt-0.5 text-success">{c.after}</div>
                </div>
              </div>
              <div className="mt-5 rounded-lg bg-foreground p-4 text-background">
                <div className="text-[10px] uppercase tracking-wider opacity-60">Result</div>
                <div className="mt-1 font-semibold">{c.result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Testimonials -------------------- */
function Testimonials() {
  const quotes = [
    {
      q: 'Foundation is a slow-trust sale. Vector built our authority signals fast — we hit #1 for "foundation repair Houston" in 27 days and inspections doubled the month after.',
      n: "Sandra Quiroz",
      r: "Owner, Quiroz Foundation Group",
    },
    {
      q: "We were getting eaten alive by Olshan. Six months with Vector and we outrank them in three of our four biggest markets. Bookings are out 9 weeks.",
      n: "Brendan Cole",
      r: "Co-founder, Cole Structural Repair",
    },
    {
      q: "A homeowner told me ChatGPT named us as the foundation expert in our city. That one $34K helical pier job paid for two years of our Vector contract.",
      n: "Tina Ravenscroft",
      r: "President, Ravenscroft Foundation Co.",
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            What foundation repair specialists say
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            We let our foundation repair specialists do the talking.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {quotes.map((q) => (
            <figure key={q.n} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="font-mono text-2xl text-accent">"</div>
              <blockquote className="mt-2 text-sm leading-relaxed">{q.q}</blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <div className="text-sm font-semibold">{q.n}</div>
                <div className="text-xs text-muted-foreground">{q.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Pricing -------------------- */
function Pricing() {
  return (
    <section id="pricing" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            Simple pricing
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Built for foundation specialists. Priced like partners.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
              Foundations
            </div>
            <div className="mt-2 text-2xl font-semibold">Local SEO + Map Pack</div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">$1,200</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Technical SEO for your site",
                "Google Business Profile optimization",
                "3 priority keyword targets",
                "Monthly rank tracking & reporting",
                "Email & Slack support",
              ].map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="text-accent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#consult"
              className="mt-8 block w-full rounded-md border border-border bg-background px-4 py-3 text-center text-sm font-semibold hover:bg-secondary"
            >
              Start with Foundations
            </a>
          </div>

          <div className="relative rounded-2xl border-2 border-accent bg-card p-8 shadow-2xl shadow-accent/10">
            <div className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Most popular
            </div>
            <div className="text-sm font-mono uppercase tracking-wider text-accent">
              Growth Engine
            </div>
            <div className="mt-2 text-2xl font-semibold">SEO + AEO + Authority</div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">$2,500</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Everything in Foundations",
                "LLM citation optimization (ChatGPT, Gemini, Perplexity)",
                "10 high-authority backlinks/month",
                "Service-area & city page expansion",
                "Dedicated account manager",
                "Monthly strategy call + report",
              ].map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="text-accent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#consult"
              className="mt-8 block w-full rounded-md bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Choose Growth Engine
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Guarantee -------------------- */
function Guarantee() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-accent/10 font-mono text-xl font-bold text-accent">
          30
        </div>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
          Rank in 30 days — or you don't pay.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          We're so confident in our foundation repair SEO system that if we don't move you onto page
          one of Google for an agreed-upon keyword within 30 days, you get the next month free. No
          fine print. No "well actually." Just results.
        </p>
      </div>
    </section>
  );
}

/* -------------------- FAQ -------------------- */
function FAQ() {
  const items = [
    {
      q: "Can a local company really outrank Olshan, Ram Jack, and Groundworks?",
      a: "Yes — and we do it constantly. National chains win on brand spend but lose on local authority signals (GBP, hyper-local content, engineer-credentialed content, review velocity). Our system stacks those signals until you outrank them in your service area.",
    },
    {
      q: "Will I compete with other foundation repair companies you work with?",
      a: "No. We work with one foundation repair firm per service area, exclusively. When you sign on, your market is locked.",
    },
    {
      q: "How fast will I see paid inspections?",
      a: "Most clients see first-page rankings within 30 days and a measurable inspection lift within 45–60 days. AI engine citations (ChatGPT, Gemini) typically start appearing in week 3–6 — which matters when a homeowner is panic-Googling a wall crack at midnight.",
    },
    {
      q: "Do you optimize for the diagnostic content homeowners search?",
      a: "Yes. We build engineer-grade diagnostic content (crack types, settlement signs, pier comparisons) so you surface for early-stage research — and own the relationship before they ever call a competitor.",
    },
    {
      q: "What if I also do basement waterproofing or crawl space work?",
      a: "Perfect — we build out the full service stack (foundation repair → waterproofing → crawl space encapsulation) so a single inspection becomes a $25K+ engagement instead of a single-trade ticket.",
    },
  ];
  return (
    <section id="faq" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">FAQ</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Common questions from foundation repair specialists.
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {items.map((i, idx) => (
            <FAQItem key={idx} {...i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
      >
        {q}
        <span className={`transition ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}

/* -------------------- Final CTA -------------------- */
function FinalCTA() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", city: "" });
  const [sent, setSent] = useState(false);
  return (
    <section id="consult" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-foreground to-foreground/90 text-background shadow-2xl">
          <div className="grid gap-10 p-8 md:p-14 lg:grid-cols-2">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-accent">
                Free strategy call
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Let's see if we can rank you in 30 days.
              </h2>
              <p className="mt-4 opacity-80">
                On the call we'll audit your current visibility across all 5 engines, show you
                exactly what your top 3 local competitors are doing, and map out a 90-day game plan.
                No pressure, no obligation.
              </p>
              <ul className="mt-6 space-y-2 text-sm opacity-90">
                <li>✓ 30-minute strategy session</li>
                <li>✓ Custom audit of your site + GBP</li>
                <li>✓ Competitor visibility breakdown</li>
                <li>✓ Walk away with a plan — even if you don't hire us</li>
              </ul>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-2xl bg-background p-6 text-foreground"
            >
              {sent ? (
                <div className="py-10 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                    ✓
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">You're booked in.</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We'll reach out within 5 minutes to confirm your strategy call.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Claim your free audit</h3>
                  <div className="mt-4 grid gap-3">
                    {[
                      ["name", "Your name"],
                      ["company", "Company name"],
                      ["email", "Email"],
                      ["phone", "Phone"],
                      ["city", "Service area (city)"],
                    ].map(([k, p]) => (
                      <input
                        key={k}
                        required
                        type={k === "email" ? "email" : "text"}
                        placeholder={p}
                        value={(form as Record<string, string>)[k]}
                        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    ))}
                  </div>
                  <button className="mt-5 w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90">
                    Book My Free Strategy Call →
                  </button>
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    We reply within 5 minutes during business hours.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Footer -------------------- */
function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2 font-mono">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-foreground text-background text-xs">
            V
          </span>
          Vector.SEO — SEO for Foundation Repair Specialists
        </div>
        <div className="flex items-center gap-5">
          <a href="https://seo.acadium.com" className="hover:text-foreground">
            seo.acadium.com
          </a>
          <a href="mailto:hello@acadium.com" className="hover:text-foreground">
            hello@acadium.com
          </a>
        </div>
      </div>
    </footer>
  );
}
