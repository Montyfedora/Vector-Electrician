import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import nicheHero from "@/assets/garage-door-hero.jpg";
import vectorBrainImg from "@/assets/vector-brain.jpg";

export const Route = createFileRoute("/garage-door")({
  head: () => ({
    meta: [
      { title: "SEO for Garage Door Repair Companies — Vector.SEO" },
      {
        name: "description",
        content:
          'Own every "garage door repair near me" search across Google, Bing, ChatGPT, Gemini, and Perplexity. Rank in 30 days, guaranteed.',
      },
      { property: "og:title", content: "SEO for Garage Door Repair Companies — Vector.SEO" },
      {
        property: "og:description",
        content:
          "Be the garage door company homeowners (and AI) call the moment the spring snaps. 15+ years of ranking experience for garage door pros.",
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
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Built for Garage Door Pros
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Be the garage door pro{" "}
            <span className="bg-gradient-to-r from-accent to-foreground bg-clip-text text-transparent">
              homeowners (and AI) call the moment the spring snaps
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            We rank residential and commercial garage door companies across Google, Bing, ChatGPT,
            Gemini, and Perplexity — so the right customer finds you the moment a spring breaks, an
            opener dies, or a new door needs installing.
          </p>
          <p className="mt-3 font-mono text-sm font-semibold uppercase tracking-wider text-accent">
            Rank in 30 days. Guaranteed.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#consult"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:opacity-90"
            >
              Get My Free Garage Door SEO Audit →
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
            <span>✓ 15+ years ranking trades contractors</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-accent/30 to-transparent blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
            <img
              src={nicheHero}
              alt="Garage Door Contractors hero"
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Avg. client result
            </div>
            <div className="mt-1 text-2xl font-bold">+356% calls</div>
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
    ["260+", "Garage door pros ranked"],
    ["15+ yrs", "Local SEO experience"],
    ["98%", "Hit page-one in 30 days"],
    ["$41M", "Client revenue attributed"],
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
      t: "A broken spring is a 60-minute decision",
      d: "When a homeowner is locked in or out of their garage, they call the first 3 numbers Google shows. If that's not you, the job is gone.",
    },
    {
      t: "Angi, Thumbtack, and Networx own page one",
      d: "Lead-gen aggregators dominate the SERP and resell the same lead to 4 competitors. You pay $40–$80 per shared lead and race to the phone.",
    },
    {
      t: "ChatGPT recommends the garage door company across town",
      d: 'More homeowners ask AI "best garage door repair near me?" If you\'re not cited, the answer is your competitor — not you.',
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            The Garage Door Trap
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Aggregators steal every "garage door repair near me" click — unless you outrank them.
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
              Outrank the aggregators on every engine — and become the AI-recommended garage door
              pro in your city.
            </h2>
            <p className="mt-5 text-muted-foreground">
              We don't do generic SEO. We've built a system specifically for garage door companies
              that combines traditional Google rankings with AI Engine Optimization (AEO) — so you
              show up whether the homeowner is searching, asking, or being recommended.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Rank for high-intent terms like 'garage door repair near me' and 'broken spring [city]'",
                "Get cited by ChatGPT, Gemini, and Perplexity when homeowners ask for recommendations",
                "Push lead-gen aggregators (Angi, Thumbtack) below your listing in the Map Pack",
                "Convert urgent searchers into same-day dispatched jobs",
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
                  { k: "garage door repair denver", e: "Google", p: 1 },
                  { k: "broken garage door spring", e: "Bing", p: 2 },
                  { k: "best garage door company denver", e: "ChatGPT", p: "cited" },
                  { k: "garage door opener installation", e: "Gemini", p: "cited" },
                  { k: "new garage door cost", e: "Perplexity", p: 3 },
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
      d: "Rank #1 in the Google Map Pack for every city, ZIP code, and neighborhood you serve — pushing aggregators below the fold.",
    },
    {
      t: "AI Engine Optimization",
      d: "Get cited by ChatGPT, Gemini, and Perplexity when homeowners ask for the best garage door pro in town.",
    },
    {
      t: "Conversion-Optimized Website",
      d: "Click-to-call buttons, same-day booking, financing, and trust badges that turn panicked searchers into dispatched trucks.",
    },
    {
      t: "Service & City Page Engine",
      d: "Dedicated pages for every service (spring repair, opener install, new doors, off-track) × every city you serve.",
    },
    {
      t: "Review & Reputation Engine",
      d: "Automated review requests after every job — because 5-star social proof is the #1 ranking signal for local search.",
    },
    {
      t: "High-Authority Link Building",
      d: "Editorial features in home improvement, real estate, and trade publications that move the rankings needle.",
    },
  ];
  return (
    <section id="services" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">What you get</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Everything garage door pros need to own their market.
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
              garage door business as an entity — your services, response times, neighborhoods, and
              reviews — into the same vector space the engines use to answer homeowner questions.
            </p>
            <p className="mt-3 text-muted-foreground">
              Translation: when someone asks "who fixes garage door springs in Arvada?" — your name
              is what comes back.
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
      who: "OverheadPro Garage Doors",
      where: "Denver, CO",
      kw: "garage door repair denver",
      before: "Page 2 (Google) · No AI citations",
      after: "#1 Google · #1 Bing · cited by ChatGPT & Perplexity",
      result: "+428 inbound calls/month",
    },
    {
      who: "SpringRight Door Co.",
      where: "Atlanta, GA",
      kw: "broken garage door spring",
      before: "70% of leads from Thumbtack",
      after: "#1 Map Pack in 14 suburbs · 8% from aggregators",
      result: "Cut lead costs by $11K/mo",
    },
    {
      who: "Coastline Garage Door",
      where: "San Diego, CA",
      kw: "new garage door installation",
      before: "$16K/mo on Google Ads",
      after: "Cut ads 60% · 31 organic installs/mo",
      result: "$118K saved annually on ad spend",
    },
  ];
  return (
    <section id="proof" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">Case studies</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Real garage door pros. Real rankings. Real revenue.
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
      q: 'Six weeks in, we were outranking Angi for "garage door repair Denver." That had never happened. Our techs are booked solid two days out.',
      n: "Russell Chang",
      r: "Owner, Chang Door Co.",
    },
    {
      q: "21 days to page one — they hit the guarantee with room to spare. Best decision we made all year, hands down.",
      n: "Bethany Lawson",
      r: "Co-founder, Lawson Garage Door Pros",
    },
    {
      q: "I get customers telling me ChatGPT recommended us. Five years ago that sentence wouldn't have made sense. Now it's a third of new jobs.",
      n: "Devon Pritchard",
      r: "President, Pritchard Overhead Door",
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            What garage door pros say
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            We let our garage door pros do the talking.
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
            Built for garage door pros. Priced like partners.
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
          We're so confident in our garage door SEO system that if we don't move you onto page one
          of Google for an agreed-upon keyword within 30 days, you get the next month free. No fine
          print. No "well actually." Just results.
        </p>
      </div>
    </section>
  );
}

/* -------------------- FAQ -------------------- */
function FAQ() {
  const items = [
    {
      q: "How is this different from a generic SEO agency?",
      a: "We only work with garage door and trades contractors. We know the keywords, the emergency-call buyer journey, opener and spring trends, schema, and the AI prompts homeowners actually use.",
    },
    {
      q: "Will I compete with other garage door companies you work with?",
      a: "No. We work with one garage door company per service area, exclusively. When you sign on, your market is locked.",
    },
    {
      q: "How fast will I see leads?",
      a: "Most clients see first-page rankings within 30 days and a measurable call lift within 45–60 days. AI engine citations (ChatGPT, Gemini) typically start appearing in week 3–6.",
    },
    {
      q: "Can I really outrank Angi, Thumbtack, and Networx?",
      a: "Yes — that's a core part of what we do. Aggregators win on volume of pages but lose on local authority signals. Our system stacks those signals (GBP, reviews, citations, schema) until you outrank them in your service area.",
    },
    {
      q: "What if I only have one truck?",
      a: "The Foundations plan is built exactly for that — owner-operators and small crews who want predictable local calls without enterprise overhead.",
    },
  ];
  return (
    <section id="faq" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">FAQ</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Common questions from garage door pros.
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
          Vector.SEO — SEO for Garage Door Pros
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
