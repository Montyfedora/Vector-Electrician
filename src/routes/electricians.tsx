import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeVisibility, submitLead, type EngineResult } from "@/lib/analyzer.functions";
import electricianHero from "@/assets/electrician-hero.jpg";
import vectorBrainImg from "@/assets/vector-brain.jpg";

export const Route = createFileRoute("/electricians")({
  head: () => ({
    meta: [
      { title: "SEO for Electricians — Vector.SEO" },
      {
        name: "description",
        content:
          "Predictable, high-intent electrical leads from Google, Bing, ChatGPT, Gemini, and Perplexity. Rank in 30 days, guaranteed.",
      },
      { property: "og:title", content: "SEO for Electricians — Vector.SEO" },
      {
        property: "og:description",
        content:
          "Be the electrician homeowners (and AI search engines) call first. 15+ years of ranking experience for electrical contractors.",
      },
      { property: "og:image", content: electricianHero },
    ],
  }),
  component: ElectriciansPage,
});

function ElectriciansPage() {
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
          href="#audit"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          Free SEO Audit →
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
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Built for Electrical
            Contractors
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Be the electrician{" "}
            <span className="bg-gradient-to-r from-accent to-foreground bg-clip-text text-transparent">
              homeowners (and AI) call first
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            We rank residential and commercial electricians across Google, Bing, ChatGPT, Gemini,
            and Perplexity — so the right customer finds you the moment the breaker trips, the panel
            upgrades, or the EV charger needs installing.
          </p>
          <p className="mt-3 font-mono text-sm font-semibold uppercase tracking-wider text-accent">
            Rank in 30 days. Guaranteed.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#audit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:opacity-90"
            >
              Get My Free Electrician SEO Audit →
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
            <span>✓ 15+ years ranking contractors</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-accent/30 to-transparent blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
            <img
              src={electricianHero}
              alt="Professional electrician working on a residential electrical panel"
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Avg. client result
            </div>
            <div className="mt-1 text-2xl font-bold">+294% calls</div>
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
    ["420+", "Electricians ranked"],
    ["15+ yrs", "Electrical SEO experience"],
    ["98%", "Hit page-one in 30 days"],
    ["$54M", "Client revenue attributed"],
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
      t: "Emergency calls go to whoever ranks #1",
      d: "A sparking outlet doesn't wait. If you're not in the top 3 of Google when they search, the call goes to your competitor — every single time.",
    },
    {
      t: "Lead-gen apps sell the same job 4 times",
      d: "Angi, HomeAdvisor, Thumbtack — you pay $50–$90 per shared lead and race three other electricians to the homeowner's voicemail.",
    },
    {
      t: "ChatGPT recommends the electrician across town",
      d: "More homeowners are asking AI \"who's the best licensed electrician near me?\" If you're not cited, you're invisible to a whole generation of customers.",
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            The Electrician's Trap
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Most electricians are one Google update away from losing the phone.
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
              Own your service area on every search engine — and every AI answer.
            </h2>
            <p className="mt-5 text-muted-foreground">
              We don't do generic SEO. We've built a system specifically for electrical contractors
              that combines traditional Google rankings with AI Engine Optimization (AEO) — so you
              show up whether the homeowner is searching, asking, or being recommended.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Rank for high-intent terms like 'electrician near me' and 'panel upgrade [city]'",
                "Get cited by ChatGPT, Gemini, and Perplexity when homeowners ask for recommendations",
                "Dominate the Google Map Pack across every ZIP code you serve",
                "Convert searchers into booked service calls — not price-shoppers",
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
                  { k: "emergency electrician phoenix", e: "Google", p: 1 },
                  { k: "panel upgrade near me", e: "Bing", p: 2 },
                  { k: "best electrician in phoenix", e: "ChatGPT", p: "cited" },
                  { k: "ev charger installation az", e: "Gemini", p: "cited" },
                  { k: "whole home generator install", e: "Perplexity", p: 3 },
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
      d: "Rank #1 in the Google Map Pack for every city, ZIP code, and neighborhood you serve — including emergency keywords.",
    },
    {
      t: "AI Engine Optimization",
      d: "Get cited by ChatGPT, Gemini, and Perplexity when homeowners ask for the best licensed electrician in town.",
    },
    {
      t: "Conversion-Optimized Website",
      d: "Click-to-call buttons, online booking, financing, and trust badges that turn visitors into dispatched trucks.",
    },
    {
      t: "Service & City Page Engine",
      d: "Dedicated pages for every service (panel upgrades, EV chargers, generators, rewires) × every city you serve — built to rank.",
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
            Everything an electrician needs to own their market.
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
              electrical business as an entity — your services, license numbers, response times,
              neighborhoods, and reviews — into the same vector space the engines use to answer
              homeowner questions.
            </p>
            <p className="mt-3 text-muted-foreground">
              Translation: when someone asks "who's the best EV charger installer in Plano?" — your
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
            4 steps from invisible to fully dispatched.
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
      who: "Voltline Electric",
      where: "Phoenix, AZ",
      kw: "emergency electrician phoenix",
      before: "Page 3 (Google) · Not cited in AI",
      after: "#1 Google · #2 Bing · cited by ChatGPT & Perplexity",
      result: "+388 inbound calls/month",
    },
    {
      who: "Cascade Electric Co.",
      where: "Seattle, WA",
      kw: "ev charger installation seattle",
      before: "No map pack presence",
      after: "Top-3 in 16 surrounding suburbs",
      result: "Fleet grew from 3 to 8 trucks in 9 months",
    },
    {
      who: "BrightCore Electrical",
      where: "Charlotte, NC",
      kw: "200 amp panel upgrade",
      before: "$19K/mo on Google Ads, 10 jobs/wk",
      after: "Cut ads 65% · 34 organic jobs/wk",
      result: "$148K saved annually on ad spend",
    },
  ];
  return (
    <section id="proof" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">Case studies</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Real electricians. Real rankings. Real revenue.
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
      q: "We dropped Thumbtack and HomeAdvisor in month two. Vector has us ranking #1 for every panel upgrade and EV install keyword in our market. The phone won't stop ringing.",
      n: "Derek Sullivan",
      r: "Owner, Sullivan Electric",
    },
    {
      q: "Skeptical about the 30-day guarantee? Don't be. They had us on page one in 21 days. Seven months in, we hired two more journeymen and a dispatcher.",
      n: "Maya Patel",
      r: "Co-founder, Patel Electrical Services",
    },
    {
      q: "When someone asks ChatGPT for the best electrician in Tampa, my company is the first name. Half my new customers tell me an AI told them to call.",
      n: "Marcus Webb",
      r: "President, Webb Power & Light",
    },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            What electricians say
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            We let the electricians do the talking.
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
  const benefits = [
    {
      t: "Agentic AI ranking agents working 24/7",
      d: "Our autonomous agents continuously monitor each keyword across Google, Bing, ChatGPT, Gemini & Perplexity — and re-optimize your pages the moment an engine shifts its algorithm.",
    },
    {
      t: "Vector math entity modeling",
      d: "We embed your business, services and service areas into the same vector space the LLMs use, so when a homeowner asks AI for the best electrician — your name is the closest match.",
    },
    {
      t: "AEO + SEO coverage on every keyword",
      d: "Each keyword gets traditional Google/Bing ranking work AND citation engineering for ChatGPT, Gemini and Perplexity. One price, all 5 engines.",
    },
    {
      t: "Done-for-you content & on-page",
      d: "Service pages, schema, internal linking and entity reinforcement built per keyword — no thin templated junk.",
    },
    {
      t: "Live rank dashboard",
      d: "Watch each keyword climb across all 5 engines in real time. No monthly PDF games.",
    },
    {
      t: "Pay per keyword, scale when you're ready",
      d: "Start with 3 keywords. Add more as the calls come in. No long contracts, no enterprise retainers.",
    },
  ];

  return (
    <section id="pricing" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">
            Simple, transparent pricing
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Pay per keyword. Powered by agentic AI.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No bloated retainers. No "SEO mystery box." Just predictable pricing per keyword you
            want to own — backed by our Vector agentic engine and the 30-day rank guarantee.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          {/* Price card */}
          <div className="relative rounded-3xl border-2 border-accent bg-card p-8 shadow-2xl shadow-accent/10">
            <div className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Vector Agentic SEO
            </div>

            <div className="text-sm font-mono uppercase tracking-wider text-accent">
              Starting at
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">$97</span>
              <span className="text-sm text-muted-foreground">per keyword / month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Billed monthly. Minimum 3 keywords. Volume pricing kicks in at 10+.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                What's included per keyword
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  "Google + Bing ranking work",
                  "ChatGPT, Gemini & Perplexity citation engineering",
                  "Entity & schema build-out",
                  "Live rank tracking across all 5 engines",
                  "30-day rank guarantee",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-0.5 text-accent">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="#audit"
              className="mt-7 block w-full rounded-md bg-accent px-4 py-3.5 text-center text-sm font-bold text-accent-foreground hover:opacity-90"
            >
              Get My Free Electrician SEO Audit →
            </a>
            <div className="mt-3 text-center text-[11px] text-muted-foreground">
              See your audit before you spend a dollar.
            </div>
          </div>

          {/* Differentiators */}
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="font-mono text-xs uppercase tracking-wider text-accent">
              Why $97 beats $2,500 retainers
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              Agentic AI + Vector math does the heavy lifting.
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Old-school agencies bill you for human hours. We bill you for keywords ranked —
              because our agents do in minutes what teams used to do in months.
            </p>
            <ul className="mt-6 space-y-4">
              {benefits.map((b, i) => (
                <li key={b.t} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-accent/15 font-mono text-[10px] font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{b.t}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{b.d}</div>
                  </div>
                </li>
              ))}
            </ul>
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
          We're so confident in our electrical SEO system that if we don't move you onto page one of
          Google for an agreed-upon keyword within 30 days, you get the next month free. No fine
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
      a: "We only work with electrical and trades contractors. We know the keywords, the emergency-call buyer journey, panel and EV-charger trends, schema, and the AI prompts homeowners actually use.",
    },
    {
      q: "Will I compete with other electricians you work with?",
      a: "No. We work with one electrical company per service area, exclusively. When you sign on, your market is locked.",
    },
    {
      q: "How fast will I see leads?",
      a: "Most clients see first-page rankings within 30 days and a measurable call lift within 45–60 days. AI engine citations (ChatGPT, Gemini) typically start appearing in week 3–6.",
    },
    {
      q: "Do I need to stop my Google Ads or LSAs?",
      a: "Not at all. Most clients run Local Services Ads alongside organic for the first 60 days, then dial paid spend down 50–80% once organic kicks in.",
    },
    {
      q: "What if I'm a small owner-operator with one truck?",
      a: "The Foundations plan is built exactly for that — owner-operators and small crews who want predictable local calls without enterprise overhead.",
    },
  ];
  return (
    <section id="faq" className="border-b border-border/60 bg-surface-subtle">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-accent">FAQ</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Common questions from electricians.
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

/* -------------------- Final CTA — Free SEO Audit -------------------- */
function FinalCTA() {
  const analyze = useServerFn(analyzeVisibility);
  const submitLeadFn = useServerFn(submitLead);

  const [keyword, setKeyword] = useState("");
  const [website, setWebsite] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<EngineResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const overall = useMemo(() => {
    if (!results) return 0;
    return Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  }, [results]);

  async function runAudit(e: FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !website.trim()) return;
    setAnalyzing(true);
    setError(null);
    setResults(null);
    try {
      const res = await analyze({ data: { keyword: keyword.trim(), website: website.trim() } });
      setResults(res.results);
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (err) {
      console.error(err);
      setError("Audit failed. Please try again in a moment.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleLead(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !name.trim()) {
      setLeadError("Add your name and email to receive the full report.");
      return;
    }
    setSending(true);
    setLeadError(null);
    try {
      const res = await submitLeadFn({
        data: {
          name: name.trim(),
          email: email.trim(),
          target: `${keyword.trim()} | ${website.trim()}`,
          snapshot: results ?? undefined,
        },
      });
      if (!res.ok) setLeadError(res.error || "Could not send your report.");
      else setSent(true);
    } catch (err) {
      console.error(err);
      setLeadError("Could not send your report. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="audit" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-foreground to-foreground/90 text-background shadow-2xl">
          <div className="grid gap-10 p-8 md:p-14 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-accent">
                Free Electrician SEO Audit
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                See exactly where you rank — across all 5 engines.
              </h2>
              <p className="mt-4 opacity-80">
                Enter the keyword you want to own (e.g.{" "}
                <span className="font-mono">"emergency electrician [your city]"</span>) and your
                website. Our Vector agents will scan Google, Bing, ChatGPT, Gemini and Perplexity in
                under 60 seconds and show you the visibility gaps costing you calls.
              </p>
              <ul className="mt-6 space-y-2 text-sm opacity-90">
                <li>✓ Live scan across all 5 search & AI engines</li>
                <li>✓ Competitor visibility breakdown for your keyword</li>
                <li>✓ 50+ data points + prioritized quick wins</li>
                <li>✓ Free — no credit card, no signup wall</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-background p-6 text-foreground md:p-8">
              <form onSubmit={runAudit} className="flex flex-col gap-3">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Keyword you want to rank for
                </label>
                <input
                  required
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. emergency electrician phoenix"
                  className="w-full rounded-md border border-border bg-background px-3 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <label className="mt-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Your website
                </label>
                <input
                  required
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="yourcompany.com"
                  className="w-full rounded-md border border-border bg-background px-3 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={analyzing || !keyword.trim() || !website.trim()}
                  className="mt-2 w-full rounded-md bg-accent px-4 py-3.5 text-sm font-bold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  {analyzing ? "Scanning all 5 engines…" : "Get My Free Electrician SEO Audit →"}
                </button>
                {error && <div className="text-xs text-destructive">{error}</div>}
                <p className="text-center text-[11px] text-muted-foreground">
                  Free · 60 seconds · No signup required
                </p>
              </form>

              {results && (
                <div
                  ref={resultsRef}
                  className="mt-6 rounded-xl border border-border bg-surface-subtle p-5"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Visibility score
                    </div>
                    <div className="text-2xl font-bold">
                      {overall}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {results.map((r) => (
                      <div
                        key={r.key}
                        className="rounded-md border border-border bg-background p-2 text-center"
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          {r.label}
                        </div>
                        <div className="mt-1 text-sm font-bold">{r.score}</div>
                      </div>
                    ))}
                  </div>

                  {sent ? (
                    <div className="mt-5 rounded-md bg-success/10 p-4 text-center text-sm text-success">
                      ✓ Full report on its way — check your inbox within 5 minutes.
                    </div>
                  ) : (
                    <form onSubmit={handleLead} className="mt-5 grid gap-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Get the full report + quick-wins playbook
                      </div>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
                      >
                        {sending ? "Sending…" : "Email Me the Full Report"}
                      </button>
                      {leadError && <div className="text-xs text-destructive">{leadError}</div>}
                    </form>
                  )}
                </div>
              )}
            </div>
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
          Vector.SEO — SEO for Electricians
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
