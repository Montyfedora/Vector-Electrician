import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import React, { useMemo, useRef, useState } from "react";
import {
  analyzeVisibility,
  submitLead,
  type EngineResult,
  type GapAnalysis,
} from "@/lib/analyzer.functions";
import vectorBrainImg from "@/assets/vector-brain.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function scoreBand(score: number): { label: string; tone: "good" | "ok" | "bad"; gap: number } {
  const gap = Math.max(0, 100 - score);
  if (score >= 70) return { label: "Strong", tone: "good", gap };
  if (score >= 40) return { label: "Needs Work", tone: "ok", gap };
  return { label: "Critical Gap", tone: "bad", gap };
}

function overallVerdict(score: number): {
  headline: string;
  sub: string;
  tone: "good" | "ok" | "bad";
} {
  if (score >= 70)
    return {
      headline: "Solid foundation — but still leaving visibility on the table.",
      sub: `${100 - score} points of untapped reach remain across AI & search engines.`,
      tone: "good",
    };
  if (score >= 40)
    return {
      headline: "You're invisible on most engines that matter.",
      sub: `${100 - score} points of growth available — competitors are capturing this traffic right now.`,
      tone: "ok",
    };
  return {
    headline: "Critical visibility gap detected.",
    sub: `${100 - score} points of lost reach. Buyers using AI search aren't finding you.`,
    tone: "bad",
  };
}

function Index() {
  const analyze = useServerFn(analyzeVisibility);
  const submitLeadFn = useServerFn(submitLead);

  const [keyword, setKeyword] = useState("");
  const [website, setWebsite] = useState("");
  const [results, setResults] = useState<EngineResult[] | null>(null);
  const [gap, setGap] = useState<GapAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzedTarget, setAnalyzedTarget] = useState<{ keyword: string; domain: string } | null>(
    null,
  );
  const resultsRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const overall = useMemo(() => {
    if (gap) return gap.overallScore;
    if (!results) return 0;
    return Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  }, [results, gap]);

  const verdict = useMemo(() => overallVerdict(overall), [overall]);
  const overallTone =
    verdict.tone === "good"
      ? "text-success"
      : verdict.tone === "ok"
        ? "text-warning"
        : "text-destructive";

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !website.trim()) return;
    setAnalyzing(true);
    setResults(null);
    setAnalyzeError(null);
    try {
      const res = await analyze({ data: { keyword: keyword.trim(), website: website.trim() } });
      setResults(res.results);
      setGap(res.gapAnalysis);
      setAnalyzedTarget({ keyword: res.keyword, domain: res.domain });
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      console.error(err);
      setAnalyzeError("Analysis failed. Please try again in a moment.");
    } finally {
      setAnalyzing(false);
    }
  }

  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSending, setLeadSending] = useState(false);
  async function handleSubmitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!leadEmail.includes("@") || !leadName.trim() || !keyword.trim() || !website.trim()) {
      setLeadError("Please enter your name, email, and run an analysis first.");
      return;
    }
    setLeadSending(true);
    setLeadError(null);
    try {
      const res = await submitLeadFn({
        data: {
          name: leadName.trim(),
          email: leadEmail.trim(),
          target: `${keyword.trim()} | ${website.trim()}`,
          snapshot: results ?? undefined,
        },
      });
      if (!res.ok) {
        setLeadError(res.error || "Could not save your request.");
      } else {
        setLeadSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setLeadError("Could not save your request. Please try again.");
    } finally {
      setLeadSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-primary rounded-sm flex items-center justify-center">
              <div className="size-2 bg-background rounded-full" />
            </div>
            <span className="font-bold tracking-tighter text-xl">VECTOR.SEO</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#analyze" className="hover:text-foreground transition-colors">
              Analyzer
            </a>
            <a href="#report" className="hover:text-foreground transition-colors">
              Free Report
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a
              href="#analyze"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all"
            >
              Run a scan
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="analyze" className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center animate-reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/15 text-accent text-xs font-mono font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            RANK IN 30 DAYS — GUARANTEED
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-[0.9] mb-8">
            Rank in 30 days. <span className="text-accent">Guaranteed.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-pretty">
            Real AEO + SEO signals → real ranking gains across Google, Bing, Perplexity, ChatGPT and
            Gemini. Move up or your next month is free.
          </p>

          <div id="analyze" className="relative max-w-3xl mx-auto">
            {/* glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/30 via-primary/20 to-accent/30 rounded-3xl blur-2xl opacity-70 animate-pulse pointer-events-none" />

            <div className="relative bg-card border-2 border-accent/40 rounded-2xl shadow-elevated p-6 md:p-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-[10px] font-mono uppercase tracking-widest text-accent">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                  </span>
                  Free · 60 seconds · No signup
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-2">
                See exactly where you rank — across all 5 engines
              </h2>
              <p className="text-sm md:text-base text-muted-foreground text-center mb-6 max-w-xl mx-auto">
                Enter your keyword and website. We'll scan Google, Bing, Perplexity, ChatGPT and
                Gemini live and show you the gaps costing you customers.
              </p>

              <form onSubmit={runAnalysis} className="flex flex-col gap-3">
                <div className="relative flex items-center">
                  <div className="absolute left-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest pointer-events-none">
                    Keyword
                  </div>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. best running shoes for marathons"
                    className="w-full pl-24 pr-4 py-4 bg-surface-subtle border border-border focus:border-accent focus:ring-2 focus:ring-accent/30 rounded-lg text-sm font-medium outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative flex items-center">
                    <div className="absolute left-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest pointer-events-none">
                      Website
                    </div>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="yourbrand.com"
                      className="w-full pl-24 pr-4 py-4 bg-surface-subtle border border-border focus:border-accent focus:ring-2 focus:ring-accent/30 rounded-lg text-sm font-medium outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={analyzing || !keyword.trim() || !website.trim()}
                    className="px-8 py-4 bg-accent text-accent-foreground font-bold rounded-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/30 whitespace-nowrap"
                  >
                    {analyzing ? "Analyzing…" : "Analyze My Visibility →"}
                  </button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <span>✓ Instant report</span>
                <span>✓ 50+ data points</span>
                <span>✓ Competitor gaps</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            <span>Google</span>
            <span>·</span>
            <span>Bing</span>
            <span>·</span>
            <span>Perplexity</span>
            <span>·</span>
            <span>ChatGPT</span>
            <span>·</span>
            <span>Gemini</span>
          </div>
        </div>
      </header>

      {/* 3 Simple Steps */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Rank in 3 simple steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              n: "01",
              t: "Send us your data",
              d: "Drop in your URL and target keyword. No logins, no dashboard access required.",
            },
            {
              n: "02",
              t: "Engines get optimized",
              d: "We deploy real AEO + SEO signals across Google, Bing, Perplexity, ChatGPT and Gemini.",
            },
            {
              n: "03",
              t: "You rank — or it's free",
              d: "Watch your positions jump within 30 days, or your next month is on us.",
            },
          ].map((s) => (
            <div key={s.n} className="border border-border rounded-2xl p-8 bg-surface-subtle">
              <div className="font-mono text-xs text-accent mb-4">{s.n}</div>
              <h3 className="text-xl font-bold mb-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
            Not all "AEO" is built equal
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why operators trust us</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="border border-border rounded-2xl p-8">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
              Copycats
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>✗ Generic audits with no real signal</li>
              <li>✗ Bot traffic and synthetic citations</li>
              <li>✗ No proof, no reporting</li>
              <li>✗ Temporary, unstable boosts</li>
              <li>✗ Zero guarantees</li>
            </ul>
          </div>
          <div className="border-2 border-primary rounded-2xl p-8 shadow-elevated">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-6">
              Vector.SEO
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>✓ Live data from 5 real engines</li>
              <li>✓ Verified citations & SERP signals</li>
              <li>✓ Fully tracked with proof per data point</li>
              <li>✓ Movement within 7–14 days</li>
              <li>✓ 30-day ranking guarantee</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-6xl mx-auto">
          {[
            { n: "15+ yrs", l: "Ranking experience" },
            { n: "1,000+", l: "Sites optimized" },
            { n: "98%", l: "Client success rate" },
            { n: "30 days", l: "To rank — guaranteed" },
          ].map((s) => (
            <div key={s.l} className="border border-border rounded-2xl p-8 bg-surface-subtle">
              <div className="text-5xl font-bold tracking-tighter text-accent mb-2">{s.n}</div>
              <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Expertise / Authority */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
              15+ Years Ranking Experience
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              We've spent <span className="text-accent">15 years</span> reverse‑engineering every
              algorithm that decides who ranks.
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              From the early PageRank era through Panda, Penguin, Hummingbird, BERT and RankBrain —
              and now the LLM retrieval layer powering ChatGPT, Perplexity and Gemini — our team has
              shipped winning playbooks through every major shift in search.
            </p>
            <p className="text-muted-foreground text-lg">
              We've built proprietary{" "}
              <span className="text-foreground font-semibold">AI &amp; agentic systems</span> that
              model how Google RankBrain weights query intent, how neural retrievers select citation
              sources, and how generative engines decide which brands get mentioned. That
              intelligence drives every signal we deploy on your site.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                t: "RankBrain modeling",
                d: "Agentic crawlers that score pages the way Google's neural ranker does.",
              },
              {
                t: "LLM retrieval lab",
                d: "Live testing across GPT, Gemini, Claude & Perplexity retrievers.",
              },
              {
                t: "Entity graph engine",
                d: "Builds the structured authority signals modern engines reward.",
              },
              {
                t: "SERP feature ops",
                d: "Targeted plays for AI Overviews, PAA, snippets & citations.",
              },
            ].map((c) => (
              <div key={c.t} className="border border-border rounded-2xl p-6 bg-surface-subtle">
                <h3 className="font-bold mb-2">{c.t}</h3>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
            What operators say
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Trusted by founders, marketers and agencies
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              q: "We jumped from page 3 to position 2 on our money keyword in 23 days. First SEO partner that actually delivered on the timeline they promised.",
              n: "Sarah Lin",
              r: "Head of Growth, Northwind SaaS",
            },
            {
              q: "Their RankBrain modeling work is in a different league. We finally understand why pages rank — and we're being cited in ChatGPT answers we never showed up in before.",
              n: "Marcus Devereaux",
              r: "Founder, Ledgerly Finance",
            },
            {
              q: "15 years of pattern recognition shows. They knew exactly which signals to pull for our niche and rebuilt our entity graph in a week. Leads up 184% MoM.",
              n: "Priya Raghavan",
              r: "CMO, Atlas Coaching Group",
            },
          ].map((t) => (
            <figure
              key={t.n}
              className="border border-border rounded-2xl p-8 bg-surface-subtle flex flex-col"
            >
              <div className="text-accent text-2xl leading-none mb-4">“</div>
              <blockquote className="text-sm leading-relaxed mb-6 flex-1">{t.q}</blockquote>
              <figcaption className="border-t border-border pt-4">
                <div className="font-bold text-sm">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Vector — Proprietary AI Ranking Engine */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
            Proprietary technology
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Meet Vector — the AI-powered second brain that ranks your site
          </h2>
          <p className="text-muted-foreground">
            Vector ingests your site, your competitors, and live SERP + LLM retrieval signals, then
            continuously rebuilds the embeddings, entity graph, and citations that decide whether
            you show up in Google, Bing, ChatGPT, Perplexity, and Gemini.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-subtle overflow-hidden shadow-elevated">
          <img
            src={vectorBrainImg}
            alt="Vector — proprietary AI ranking engine: crawl, embed, entity graph, semantic match, citation push around a neural second brain"
            width={1536}
            height={1024}
            loading="lazy"
            className="w-full h-auto block"
          />
        </div>
        <div className="grid md:grid-cols-5 gap-4 mt-8">
          {[
            {
              n: "01",
              t: "Crawl",
              d: "Your site, top 20 SERP competitors, and LLM-cited sources.",
            },
            {
              n: "02",
              t: "Embed",
              d: "Convert every page into high-dimensional vector embeddings.",
            },
            {
              n: "03",
              t: "Entity Graph",
              d: "Rebuild the entities, relationships, and topical authority signals engines reward.",
            },
            {
              n: "04",
              t: "Semantic Match",
              d: "Score gaps against the queries your buyers actually ask.",
            },
            {
              n: "05",
              t: "Citation Push",
              d: "Place you inside AI Overviews, Perplexity answers, and ChatGPT retrievals.",
            },
          ].map((s) => (
            <div key={s.n} className="border border-border rounded-xl p-5 bg-background">
              <div className="font-mono text-[11px] text-accent mb-2">{s.n}</div>
              <div className="font-bold text-sm mb-1">{s.t}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Studies */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
            Case studies
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Real engines. Real movement. Real revenue.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tag: "B2B SaaS",
              title: "Northwind — workflow automation platform",
              kw: '"workflow automation software"',
              before: "Google #28 · Not cited in ChatGPT or Perplexity",
              after: "Google #2 · Cited #1 in ChatGPT · Cited #3 in Perplexity",
              metric: "+312% organic demos in 60 days",
            },
            {
              tag: "Coaching",
              title: "Atlas Coaching Group — executive coaching",
              kw: '"executive coaching firms"',
              before: "Google #22 · No AI Overview presence",
              after: "Google #3 · Featured in Google AI Overview · Perplexity #1",
              metric: "+184% qualified leads MoM",
            },
            {
              tag: "Fintech",
              title: "Ledgerly — small-business accounting",
              kw: '"best accounting software for agencies"',
              before: "Google #41 · Bing #35 · Zero LLM citations",
              after: "Google #4 · Bing #2 · Cited in Gemini, ChatGPT & Perplexity",
              metric: "$48k MRR added in 90 days",
            },
          ].map((c) => (
            <article
              key={c.title}
              className="border border-border rounded-2xl p-8 bg-surface-subtle flex flex-col"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                {c.tag}
              </div>
              <h3 className="font-bold text-lg mb-2">{c.title}</h3>
              <p className="text-xs font-mono text-muted-foreground mb-6">Target: {c.kw}</p>
              <div className="space-y-3 text-sm mb-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Before
                  </div>
                  <div className="text-muted-foreground">{c.before}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                    After
                  </div>
                  <div className="font-medium">{c.after}</div>
                </div>
              </div>
              <div className="mt-auto border-t border-border pt-4">
                <div className="text-xl font-bold text-accent">{c.metric}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section ref={resultsRef} className="max-w-7xl mx-auto px-6 py-12">
        {!results && !analyzing && !analyzeError && (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
            <p className="font-mono text-xs uppercase tracking-widest mb-2">Awaiting input</p>
            <p>Enter a keyword or URL above to generate a live visibility report.</p>
          </div>
        )}

        {analyzeError && !analyzing && (
          <div className="border border-destructive/40 bg-destructive/5 text-destructive rounded-2xl p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest mb-1">Error</p>
            <p>{analyzeError}</p>
          </div>
        )}

        {analyzing && <AnalyzingAnimation keyword={keyword} website={website} />}

        {results && (
          <div className="animate-reveal">
            <div className="border border-border rounded-2xl p-6 md:p-8 mb-8 bg-surface-subtle">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">
                    Diagnostic Report
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    <span className="font-mono text-accent">
                      {analyzedTarget?.keyword ?? keyword}
                    </span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="font-mono text-accent">
                      {analyzedTarget?.domain ?? website}
                    </span>
                  </h2>
                  <p className={`text-base font-semibold mt-3 ${overallTone}`}>
                    {verdict.headline}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{verdict.sub}</p>
                </div>
                <div className="flex flex-col items-start md:items-end shrink-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-6xl font-mono font-bold tracking-tighter ${overallTone}`}
                    >
                      {overall}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <div className="w-48 mt-2 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full transition-all ${verdict.tone === "good" ? "bg-success" : verdict.tone === "ok" ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${overall}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
                    {100 - overall} pts room to improve
                  </p>
                </div>
              </div>
            </div>

            {gap && <GapAnalysisPanel gap={gap} />}

            <div className="space-y-4">
              {results.map((r) => (
                <EngineCard key={r.key} result={r} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <a
                href="#report"
                onClick={() => reportRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Unlock the full insight report →
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Lead capture */}
      <section ref={reportRef} id="report" className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-px bg-primary-foreground animate-scanline" />
          </div>
          <div className="flex-1 relative">
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary-foreground/60 mb-3">
              Free Insight Report
            </p>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Get the full AEO + SEO gap analysis
            </h3>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              We audit 50+ data points across every major engine and show you exactly how ranking
              for your keywords translates into customers.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-primary-foreground/80">
              <li>· Per-engine ranking breakdown</li>
              <li>· Competitor citation map</li>
              <li>· LLM entity recognition score</li>
              <li>· 90-day growth roadmap</li>
            </ul>
          </div>

          <div className="w-full md:w-auto md:min-w-[360px] relative">
            {!leadSubmitted ? (
              <form onSubmit={handleSubmitLead} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Full name"
                  className="bg-primary-foreground/10 border border-primary-foreground/20 px-5 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-foreground/40 placeholder:text-primary-foreground/50"
                />
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="work@company.com"
                  className="bg-primary-foreground/10 border border-primary-foreground/20 px-5 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-foreground/40 placeholder:text-primary-foreground/50"
                />
                <button
                  disabled={leadSending}
                  className="bg-background text-foreground font-bold px-6 py-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {leadSending ? "Sending…" : "Send my free report"}
                </button>
                {leadError && (
                  <p className="text-[12px] text-destructive-foreground bg-destructive/30 px-3 py-2 rounded">
                    {leadError}
                  </p>
                )}
                <p className="text-[11px] text-primary-foreground/50">
                  No spam. We email the report within 5 minutes.
                </p>
              </form>
            ) : (
              <div className="bg-primary-foreground/10 border border-primary-foreground/20 p-6 rounded-lg">
                <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">
                  Confirmed
                </p>
                <p className="font-semibold">Your insight report is on the way.</p>
                <p className="text-sm text-primary-foreground/70 mt-2">
                  Check {leadEmail} within 5 minutes.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
            Service Packages
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Done-for-you SEO &amp; AEO
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pick a tier — we handle the optimization, citations, and reporting end-to-end.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            tier="Foundations (On-site & Off-site SEO)"
            price="$1,200"
            features={[
              "Technical SEO",
              "3 Keyword Targets",
              "Keyword Tracking",
              "Email & Slack Support",
            ]}
            cta="Choose Foundations"
            example={{
              useCase:
                "Coaching business — Denver-based executive coach targeting local prospects.",
              report: [
                { kw: "executive coach denver", before: "#18", after: "#4" },
                { kw: "leadership coaching colorado", before: "#27", after: "#7" },
                { kw: "business coach near me", before: "Not ranked", after: "#9" },
              ],
            }}
          />
          <PricingCard
            tier="Growth Engine (SEO & AEO)"
            price="$2,500"
            features={[
              "Everything in Foundations (Google & Bing)",
              "LLM citation optimization (ChatGPT, Gemini, Perplexity)",
              "10 high-authority backlinks",
              "Dedicated Account Manager",
              "Monthly report",
            ]}
            cta="Choose Growth"
            highlight
            example={{
              useCase:
                "Coaching business — scaling a 7-figure coaching practice with AI search visibility.",
              report: [
                { kw: "executive coaching firms", before: "#22", after: "#3" },
                { kw: "ChatGPT: 'best executive coaches'", before: "Not cited", after: "Cited #2" },
                {
                  kw: "Perplexity: 'top leadership coaches'",
                  before: "Not cited",
                  after: "Cited #1",
                },
                { kw: "Gemini AI Overview citation", before: "Absent", after: "Featured" },
              ],
            }}
          />
          <PricingCard
            tier="Authority"
            price="Custom"
            features={[
              "Full multi-engine dominance",
              "Custom data pipelines",
              "PR & media placement",
              "Dedicated growth analyst",
            ]}
            cta="Contact sales"
          />
        </div>
      </section>

      {/* Guarantee */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="border-2 border-accent/30 bg-accent/5 rounded-2xl p-8 md:p-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
            The 30-day guarantee
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            No movement? You don't pay.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            If your rankings don't improve within 30 days, we re-run your campaign at no cost —
            until they do. We take all the risk so you can focus on growth.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span>· 100% Risk-Free</span>
            <span>· 30-Day Guarantee</span>
            <span>· No Questions Asked</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to know
          </h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "Will this work for my site?",
              a: "If your page is indexed and ranking somewhere between positions 3 and 30, our system is highly effective at pushing established content into top spots across SEO and AEO engines.",
            },
            {
              q: "Is this black hat?",
              a: "No. We use real signals, real citations, and real engagement — the same behavior Google, Perplexity, and ChatGPT reward organically. No bots, no scripts.",
            },
            {
              q: "Do I need to give dashboard access?",
              a: "Zero access required. No passwords, no Search Console, no analytics. We just need your URL and the keyword you want to rank for.",
            },
            {
              q: "When will I see results?",
              a: "Most clients see meaningful ranking movement within 7–14 days, with full lift inside 30 days — backed by our guarantee.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="border border-border rounded-xl p-5 group bg-surface-subtle"
            >
              <summary className="font-semibold cursor-pointer flex items-center justify-between">
                {f.q}
                <span className="text-accent text-xl group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-5 bg-primary rounded-sm" />
            <span className="font-bold tracking-tighter">VECTOR.SEO</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest text-center">
            © 2026 Vector Data Systems · Performance metrics are estimates based on current LLM
            indexing cycles.
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  features,
  cta,
  highlight,
  example,
}: {
  tier: string;
  price: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  example?: {
    useCase: string;
    report: { kw: string; before: string; after: string }[];
  };
}) {
  return (
    <div
      className={`p-8 rounded-2xl flex flex-col relative ${
        highlight ? "border-2 border-primary shadow-elevated" : "border border-border"
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h4
          className={`font-mono text-xs font-bold uppercase tracking-widest mb-2 ${highlight ? "text-accent" : "text-muted-foreground"}`}
        >
          {tier}
        </h4>
        <div className="text-4xl font-bold tracking-tight">
          {price}
          {price !== "Custom" && (
            <span className="text-base font-normal text-muted-foreground">/mo</span>
          )}
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-3 text-sm ${highlight ? "font-medium text-foreground" : "text-muted-foreground"}`}
          >
            <div className="size-1.5 bg-accent rounded-full shrink-0 mt-2" />
            {f}
          </li>
        ))}
      </ul>
      {example && (
        <details className="mb-6 border border-border rounded-lg bg-surface-subtle group">
          <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-accent flex items-center justify-between">
            See Example
            <span className="text-accent text-lg group-open:rotate-45 transition-transform">+</span>
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Use Case
              </p>
              <p className="text-xs text-foreground">{example.useCase}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Sample Report
              </p>
              <div className="space-y-1.5">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border pb-1">
                  <span>Keyword / Engine</span>
                  <span className="text-right">Before</span>
                  <span className="text-right">After</span>
                </div>
                {example.report.map((r) => (
                  <div
                    key={r.kw}
                    className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs items-center"
                  >
                    <span className="text-foreground truncate">{r.kw}</span>
                    <span className="text-right text-muted-foreground line-through">
                      {r.before}
                    </span>
                    <span className="text-right text-accent font-bold">{r.after}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      )}
      <button
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          highlight
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border hover:bg-surface-subtle"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

const ENGINES: { key: string; label: string; type: "SEO" | "AEO"; task: string }[] = [
  {
    key: "google",
    label: "Google Search",
    type: "SEO",
    task: "Scanning top 20 organic results & SERP features",
  },
  { key: "bing", label: "Bing", type: "SEO", task: "Crawling Bing organic ranking" },
  {
    key: "perplexity",
    label: "Perplexity",
    type: "AEO",
    task: "Querying live Perplexity grounded answer",
  },
  { key: "chatgpt", label: "ChatGPT", type: "AEO", task: "Probing ChatGPT browse-mode retrieval" },
  {
    key: "gemini",
    label: "Google Gemini",
    type: "AEO",
    task: "Reading Google AI Overview citations",
  },
];

function AnalyzingAnimation({ keyword, website }: { keyword: string; website: string }) {
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 850);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = (now - start) / 1000;
      // Asymptotic toward 95% so it never visually completes before results land
      const pct = Math.min(95, 100 * (1 - Math.exp(-elapsed / 6)));
      setProgress(pct);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-surface-subtle animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Live audit in progress
          </p>
          <h2 className="text-xl font-bold tracking-tight">
            Probing 5 engines for <span className="font-mono text-accent">{keyword}</span>
            <span className="text-muted-foreground"> · </span>
            <span className="font-mono text-accent">{website}</span>
          </h2>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-mono font-bold tracking-tighter tabular-nums">
            {Math.round(progress)}
            <span className="text-base text-muted-foreground">%</span>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            complete
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-border overflow-hidden mb-6">
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {ENGINES.map((e, i) => {
          const active = tick % ENGINES.length === i;
          const done = progress > (i + 1) * (95 / ENGINES.length);
          return (
            <div
              key={e.key}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all ${
                active ? "border-accent/60 bg-accent/5" : "border-border bg-background"
              }`}
            >
              <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                {done ? (
                  <svg viewBox="0 0 20 20" className="w-5 h-5 text-success animate-scale-in">
                    <path fill="currentColor" d="M7.5 13.5L4 10l-1.5 1.5L7.5 16.5l10-10L16 5z" />
                  </svg>
                ) : (
                  <span
                    className={`block w-3 h-3 rounded-full border-2 border-accent ${active ? "border-t-transparent animate-spin" : "opacity-40"}`}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight">{e.label}</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-px rounded">
                    {e.type}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {done ? "Done — analyzing signals" : e.task}
                </div>
              </div>
              {active && !done && (
                <div className="shrink-0 flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-6 text-center">
        Cross-referencing {ENGINES.length} engines · ~50 data points per engine
      </p>
    </div>
  );
}

function EngineCard({ result }: { result: EngineResult }) {
  const [open, setOpen] = useState(false);
  const band = scoreBand(result.score);
  const toneBg =
    band.tone === "good"
      ? "bg-success/10 text-success border-success/30"
      : band.tone === "ok"
        ? "bg-warning/15 text-warning border-warning/30"
        : "bg-destructive/10 text-destructive border-destructive/30";
  const barColor =
    band.tone === "good" ? "bg-success" : band.tone === "ok" ? "bg-warning" : "bg-destructive";

  return (
    <div className="border border-border rounded-xl bg-surface-subtle overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 md:w-56 shrink-0">
          <div>
            <span className="text-sm font-bold tracking-tight block">{result.label}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {result.type}
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${toneBg}`}>
            {band.label}
          </span>
        </div>

        <div className="flex-1">
          <p className="text-sm text-foreground/80">{result.note}</p>
          <div className="w-full bg-border h-1 mt-2 rounded-full overflow-hidden">
            <div
              className={`${barColor} h-full transition-all`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:w-56 justify-end shrink-0">
          <div className="text-right">
            <div className="text-3xl font-mono font-bold tracking-tighter">
              {result.score}
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {100 - result.score} pts to gain
            </div>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-[11px] font-mono uppercase tracking-widest border border-border px-3 py-2 rounded-md hover:bg-background transition-colors"
            aria-expanded={open}
          >
            {open ? "Hide" : "Proof"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 py-5 animate-fade-in">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            What we checked
          </p>
          <p className="text-sm mb-4">{result.details.summary}</p>

          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Your position
          </p>
          <p className="text-sm font-medium mb-4">{result.details.yourPosition}</p>

          {result.details.dataPoints.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Data points checked ({result.details.dataPoints.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.details.dataPoints.map((dp, i) => {
                  const dot =
                    dp.status === "good"
                      ? "bg-success"
                      : dp.status === "ok"
                        ? "bg-warning"
                        : dp.status === "bad"
                          ? "bg-destructive"
                          : "bg-muted-foreground/40";
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 text-sm border border-border rounded-md px-3 py-2 bg-surface-subtle"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                        <span className="text-muted-foreground truncate">{dp.label}</span>
                      </div>
                      <span className="font-mono text-xs font-medium truncate max-w-[50%] text-right">
                        {dp.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.details.competitors.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Competitors winning this slot
              </p>
              <ul className="space-y-1.5">
                {result.details.competitors.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2 bg-surface-subtle"
                  >
                    <span className="font-mono text-foreground truncate">{c.domain}</span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-accent shrink-0">
                      {c.position}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.details.evidence.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Evidence — {result.type === "SEO" ? "top organic results" : "AI-cited sources"}
              </p>
              <ul className="space-y-2">
                {result.details.evidence.map((ev, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm border border-border rounded-md p-3 bg-surface-subtle"
                  >
                    <span className="font-mono text-[11px] text-muted-foreground mt-0.5 shrink-0">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{ev.title}</div>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-accent hover:underline truncate block"
                        >
                          {ev.url}
                        </a>
                      )}
                      {ev.meta && (
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                          {ev.meta}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.details.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Recommended actions
              </p>
              <ul className="space-y-1.5">
                {result.details.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-0.5">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GapAnalysisPanel({ gap }: { gap: GapAnalysis }) {
  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 mb-8 bg-background">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-1">
            Gap Analysis
          </p>
          <h3 className="text-xl font-bold tracking-tight">
            AEO + SEO breakdown · {gap.totalDataPoints} data points
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ScoreTile label="AEO Score" sub="AI engines (60% weight)" value={gap.aeoScore} />
        <ScoreTile label="SEO Score" sub="Search engines (40% weight)" value={gap.seoScore} />
        <ScoreTile label="Overall" sub="Weighted index" value={gap.overallScore} highlight />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Top competitors winning your keyword
          </p>
          {gap.topCompetitors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recurring competitors detected.</p>
          ) : (
            <ul className="space-y-2">
              {gap.topCompetitors.map((c) => (
                <li
                  key={c.domain}
                  className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2 bg-surface-subtle"
                >
                  <span className="font-mono truncate">{c.domain}</span>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground shrink-0">
                    {c.appearances}× · {c.engines.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Top quick wins (prioritized)
          </p>
          {gap.quickWins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No critical actions surfaced.</p>
          ) : (
            <ul className="space-y-2">
              {gap.quickWins.slice(0, 5).map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm border border-border rounded-md px-3 py-2 bg-surface-subtle"
                >
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-px rounded shrink-0 ${q.priority === 1 ? "bg-destructive/15 text-destructive" : q.priority === 2 ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}
                  >
                    P{q.priority}
                  </span>
                  <span>{q.action}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {gap.missingFeatures.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Missing signals ({gap.missingFeatures.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {gap.missingFeatures.map((m, i) => (
              <span
                key={i}
                className="text-[11px] font-mono px-2 py-1 rounded border border-destructive/30 bg-destructive/5 text-destructive"
              >
                {m.engine}: {m.feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreTile({
  label,
  sub,
  value,
  highlight,
}: {
  label: string;
  sub: string;
  value: number;
  highlight?: boolean;
}) {
  const tone = value >= 70 ? "text-success" : value >= 40 ? "text-warning" : "text-destructive";
  const bar = value >= 70 ? "bg-success" : value >= 40 ? "bg-warning" : "bg-destructive";
  return (
    <div
      className={`rounded-xl p-4 border ${highlight ? "border-accent/40 bg-accent/5" : "border-border bg-surface-subtle"}`}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className={`text-3xl font-mono font-bold tracking-tighter ${tone}`}>{value}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
        {sub}
      </p>
      <div className="w-full h-1 mt-2 rounded-full bg-border overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
