import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAnonServer } from "@/integrations/supabase/client.anon-server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type EngineKey = "google" | "bing" | "perplexity" | "chatgpt" | "gemini";

export type EvidenceItem = {
  title: string;
  url?: string;
  meta?: string;
};

export type DataPoint = {
  label: string;
  value: string;
  status: "good" | "ok" | "bad" | "info";
};

export type CompetitorRow = {
  domain: string;
  position: string; // e.g. "#1" or "Cited #2"
  source: string; // engine label
};

export type EngineDetails = {
  summary: string;
  yourPosition: string;
  evidence: EvidenceItem[];
  dataPoints: DataPoint[];
  competitors: CompetitorRow[];
  recommendations: string[];
  rawCount?: number;
};

export type EngineResult = {
  key: EngineKey;
  label: string;
  type: "SEO" | "AEO";
  score: number;
  note: string;
  details: EngineDetails;
};

export type GapAnalysis = {
  aeoScore: number;
  seoScore: number;
  overallScore: number;
  topCompetitors: { domain: string; appearances: number; engines: string[] }[];
  missingFeatures: { feature: string; engine: string; impact: "high" | "medium" | "low" }[];
  quickWins: { action: string; rationale: string; priority: 1 | 2 | 3 }[];
  totalDataPoints: number;
};

const inputSchema = z.object({
  keyword: z.string().min(1).max(300),
  website: z.string().min(1).max(300),
});

function extractDomain(input: string): string | null {
  const trimmed = input.trim();
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (u.hostname.includes(".")) return u.hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  const m = trimmed.replace(/^www\./, "").match(/^([a-z0-9-]+\.[a-z0-9.-]+)/i);
  return m ? m[1] : null;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

async function serpApiSearch(engine: "google" | "bing", query: string) {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error("SERPAPI_KEY not configured");
  const params = new URLSearchParams({ engine, q: query, api_key: key, num: "20" });
  const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!res.ok) throw new Error(`SerpApi ${engine} ${res.status}`);
  return res.json() as Promise<any>;
}

function rankInOrganic(results: any[], domain: string | null): number | null {
  if (!domain || !Array.isArray(results)) return null;
  for (let i = 0; i < results.length; i++) {
    const link: string = results[i]?.link || "";
    if (link.toLowerCase().includes(domain.toLowerCase())) return i + 1;
  }
  return null;
}

function scoreFromRank(rank: number | null, hasFeature: boolean): { score: number; note: string } {
  if (rank == null && !hasFeature) return { score: 18, note: "Not visible in the top 5 results" };
  if (rank == null && hasFeature)
    return { score: 55, note: "Cited in SERP features but no organic rank" };
  let s = Math.max(20, Math.round(100 - (rank! - 1) * 4.5));
  if (hasFeature) s = Math.min(100, s + 8);
  let note = `Ranking at position ${rank}`;
  if (hasFeature) note += " — featured in SERP enrichments";
  return { score: s, note };
}

function topOrganic(results: any[], limit = 5): EvidenceItem[] {
  if (!Array.isArray(results)) return [];
  return results.slice(0, limit).map((r, i) => ({
    title: r.title || r.link || `Result ${i + 1}`,
    url: r.link,
    meta: `#${i + 1}${r.displayed_link ? ` · ${r.displayed_link}` : ""}`,
  }));
}

function emptyDetails(reason = "Lookup failed"): EngineDetails {
  return {
    summary: reason,
    yourPosition: "Unknown",
    evidence: [],
    dataPoints: [],
    competitors: [],
    recommendations: [],
  };
}

// ---------- Engines ----------

async function analyzeGoogle(query: string, domain: string): Promise<EngineResult> {
  try {
    const data = await serpApiSearch("google", query);
    const organic: any[] = data.organic_results || [];
    const rank = rankInOrganic(organic, domain);
    const top = organic[0] || {};
    const aiOverview = !!data.ai_overview;
    const aiSources: any[] = data.ai_overview?.sources || data.ai_overview?.references || [];
    const aiCitesYou = aiSources.some((s) =>
      (s.link || s.source || "").toLowerCase().includes(domain.toLowerCase()),
    );
    const featured = !!data.featured_snippet;
    const answerBox = !!data.answer_box;
    const knowledge = !!data.knowledge_graph;
    const paa = (data.related_questions || data.people_also_ask || []) as any[];
    const related = (data.related_searches || []) as any[];
    const sitelinks = !!(top.sitelinks || top.inline_sitelinks);
    const features: string[] = [];
    if (aiOverview) features.push("AI Overview");
    if (featured) features.push("Featured Snippet");
    if (answerBox) features.push("Answer Box");
    if (knowledge) features.push("Knowledge Panel");
    const { score, note } = scoreFromRank(rank, features.length > 0);
    const yourEntry = rank ? organic[rank - 1] : null;

    const competitors: CompetitorRow[] = organic
      .slice(0, 5)
      .filter((r) => !(r.link || "").toLowerCase().includes(domain.toLowerCase()))
      .slice(0, 5)
      .map((r, i) => ({
        domain: hostOf(r.link || ""),
        position: `#${organic.indexOf(r) + 1}`,
        source: "Google",
      }));

    const dataPoints: DataPoint[] = [
      {
        label: "Organic rank",
        value: rank ? `#${rank}` : "Not in top 20",
        status: rank && rank <= 3 ? "good" : rank && rank <= 10 ? "ok" : "bad",
      },
      {
        label: "Top 3 presence",
        value: rank && rank <= 3 ? "Yes" : "No",
        status: rank && rank <= 3 ? "good" : "bad",
      },
      {
        label: "Top 10 presence",
        value: rank && rank <= 10 ? "Yes" : "No",
        status: rank && rank <= 10 ? "good" : "bad",
      },
      {
        label: "Title length",
        value: yourEntry?.title ? `${yourEntry.title.length} chars` : "—",
        status: yourEntry?.title
          ? yourEntry.title.length >= 40 && yourEntry.title.length <= 60
            ? "good"
            : "ok"
          : "info",
      },
      {
        label: "Meta description length",
        value: yourEntry?.snippet ? `${yourEntry.snippet.length} chars` : "—",
        status: yourEntry?.snippet
          ? yourEntry.snippet.length >= 120 && yourEntry.snippet.length <= 160
            ? "good"
            : "ok"
          : "info",
      },
      {
        label: "AI Overview present",
        value: aiOverview ? "Yes" : "No",
        status: aiOverview ? "info" : "ok",
      },
      {
        label: "AI Overview cites you",
        value: aiOverview ? (aiCitesYou ? "Yes" : "No") : "n/a",
        status: aiCitesYou ? "good" : aiOverview ? "bad" : "info",
      },
      {
        label: "Featured Snippet",
        value: featured ? "Yes" : "No",
        status: featured ? "info" : "ok",
      },
      {
        label: "Knowledge Panel",
        value: knowledge ? "Yes" : "No",
        status: knowledge ? "info" : "ok",
      },
      {
        label: "People Also Ask",
        value: `${paa.length} questions`,
        status: paa.length > 0 ? "info" : "ok",
      },
      { label: "Related searches", value: `${related.length}`, status: "info" },
      { label: "Sitelinks", value: sitelinks ? "Yes" : "No", status: sitelinks ? "good" : "ok" },
    ];

    const recommendations: string[] = [];
    if (!rank || rank > 10)
      recommendations.push("Publish a deeply on-topic landing page targeting this exact keyword.");
    if (aiOverview && !aiCitesYou)
      recommendations.push(
        "Add structured FAQ + How-To schema and concise answer paragraphs to win the AI Overview citation.",
      );
    if (paa.length > 0)
      recommendations.push(
        `Answer the ${paa.length} People-Also-Ask questions on-page to capture PAA real estate.`,
      );
    if (!featured)
      recommendations.push(
        "Format a clear 40–60 word definition near the top of your page to compete for the Featured Snippet.",
      );
    if (yourEntry?.title && (yourEntry.title.length < 40 || yourEntry.title.length > 60))
      recommendations.push(
        "Tighten your title tag to 50–60 characters with the keyword in the first 30 characters.",
      );

    return {
      key: "google",
      label: "Google Search",
      type: "SEO",
      score,
      note,
      details: {
        summary: `Scanned the top ${organic.length} Google organic results${features.length ? ` plus SERP features: ${features.join(", ")}.` : "."}`,
        yourPosition: rank
          ? `${domain} ranks at position #${rank}`
          : `${domain} does not appear in the top 5 organic results`,
        evidence: topOrganic(organic, 5),
        dataPoints,
        competitors,
        recommendations,
        rawCount: organic.length,
      },
    };
  } catch (e) {
    console.error("google analyze failed", e);
    return {
      key: "google",
      label: "Google Search",
      type: "SEO",
      score: 0,
      note: "Lookup failed",
      details: emptyDetails(),
    };
  }
}

async function analyzeBing(query: string, domain: string): Promise<EngineResult> {
  try {
    const data = await serpApiSearch("bing", query);
    const organic: any[] = data.organic_results || [];
    const rank = rankInOrganic(organic, domain);
    const yourEntry = rank ? organic[rank - 1] : null;
    const related = (data.related_searches || []) as any[];
    const { score, note } = scoreFromRank(rank, false);
    const competitors: CompetitorRow[] = organic
      .slice(0, 5)
      .filter((r) => !(r.link || "").toLowerCase().includes(domain.toLowerCase()))
      .slice(0, 5)
      .map((r) => ({
        domain: hostOf(r.link || ""),
        position: `#${organic.indexOf(r) + 1}`,
        source: "Bing",
      }));

    const dataPoints: DataPoint[] = [
      {
        label: "Organic rank",
        value: rank ? `#${rank}` : "Not in top 20",
        status: rank && rank <= 3 ? "good" : rank && rank <= 10 ? "ok" : "bad",
      },
      {
        label: "Top 5 presence",
        value: rank && rank <= 5 ? "Yes" : "No",
        status: rank && rank <= 5 ? "good" : "bad",
      },
      {
        label: "Top 10 presence",
        value: rank && rank <= 10 ? "Yes" : "No",
        status: rank && rank <= 10 ? "good" : "bad",
      },
      {
        label: "Snippet length",
        value: yourEntry?.snippet ? `${yourEntry.snippet.length} chars` : "—",
        status: yourEntry?.snippet ? "ok" : "info",
      },
      { label: "Displayed URL", value: yourEntry?.displayed_link || "—", status: "info" },
      { label: "Related searches", value: `${related.length}`, status: "info" },
      { label: "Total organic results", value: `${organic.length}`, status: "info" },
      {
        label: "Deep links",
        value: yourEntry?.sitelinks ? "Yes" : "No",
        status: yourEntry?.sitelinks ? "good" : "ok",
      },
    ];

    const recommendations: string[] = [];
    if (!rank)
      recommendations.push(
        "Submit your site to Bing Webmaster Tools and request indexing for your target page.",
      );
    if (rank && rank > 5)
      recommendations.push(
        "Bing weighs exact-match anchors heavily — earn 2–3 backlinks with the keyword in anchor text.",
      );
    if (!yourEntry?.sitelinks)
      recommendations.push(
        "Improve internal linking and add a clear nav structure to earn Bing deep links.",
      );

    return {
      key: "bing",
      label: "Bing",
      type: "SEO",
      score,
      note,
      details: {
        summary: `Searched Bing and scanned ${organic.length} organic results.`,
        yourPosition: rank
          ? `${domain} ranks at position #${rank}`
          : `${domain} does not appear in the top 5 organic results`,
        evidence: topOrganic(organic, 5),
        dataPoints,
        competitors,
        recommendations,
        rawCount: organic.length,
      },
    };
  } catch (e) {
    console.error("bing analyze failed", e);
    return {
      key: "bing",
      label: "Bing",
      type: "SEO",
      score: 0,
      note: "Lookup failed",
      details: emptyDetails(),
    };
  }
}

async function analyzeGemini(query: string, domain: string): Promise<EngineResult> {
  try {
    const data = await serpApiSearch("google", query);
    const ai = data.ai_overview;
    const sources: any[] = ai?.sources || ai?.references || [];
    const citedIdx = sources.findIndex((s) =>
      (s.link || s.source || "").toLowerCase().includes(domain.toLowerCase()),
    );
    const cited = citedIdx >= 0;
    const uniqueDomains = new Set(
      sources.map((s) => hostOf(s.link || s.source || "")).filter(Boolean),
    );
    const evidence: EvidenceItem[] = sources.slice(0, 5).map((s, i) => ({
      title: s.title || s.source || s.link || `Source ${i + 1}`,
      url: s.link,
      meta: `Cited source #${i + 1}`,
    }));
    const competitors: CompetitorRow[] = sources
      .slice(0, 5)
      .filter((s) => !(s.link || "").toLowerCase().includes(domain.toLowerCase()))
      .slice(0, 5)
      .map((s, i) => ({
        domain: hostOf(s.link || ""),
        position: `Cited #${sources.indexOf(s) + 1}`,
        source: "Gemini / AI Overview",
      }));

    if (!ai) {
      return {
        key: "gemini",
        label: "Google Gemini",
        type: "AEO",
        score: 22,
        note: "No AI Overview surfaced for this query",
        details: {
          summary: `Google did not generate an AI Overview for "${query}". Gemini-class answers are not indexing this query yet.`,
          yourPosition: "Not applicable — no AI answer generated",
          evidence: [],
          dataPoints: [
            { label: "AI Overview present", value: "No", status: "bad" },
            { label: "Source count", value: "0", status: "info" },
            { label: "Your citation index", value: "Not cited", status: "bad" },
            { label: "Source diversity", value: "0 domains", status: "info" },
          ],
          competitors: [],
          recommendations: [
            "Publish a clear, structured answer page (FAQ schema, definition paragraph, bullet list) so Google can pull a Gemini-class summary.",
            "Build topical authority — Gemini favors well-linked entity pages over thin content.",
          ],
        },
      };
    }

    const score = cited ? Math.max(72, 95 - citedIdx * 5) : 38;
    const dataPoints: DataPoint[] = [
      { label: "AI Overview present", value: "Yes", status: "good" },
      { label: "Source count", value: `${sources.length}`, status: "info" },
      {
        label: "Your citation index",
        value: cited ? `#${citedIdx + 1}` : "Not cited",
        status: cited ? "good" : "bad",
      },
      { label: "Source diversity", value: `${uniqueDomains.size} unique domains`, status: "info" },
      {
        label: "Top cited domain",
        value: sources[0] ? hostOf(sources[0].link || sources[0].source || "") : "—",
        status: "info",
      },
      {
        label: "AI answer length",
        value: ai.text ? `${ai.text.length} chars` : "—",
        status: "info",
      },
    ];

    const recommendations: string[] = cited
      ? [
          "Maintain freshness: update this page quarterly so Gemini keeps citing it.",
          "Add structured author + reviewed-by markup to strengthen E-E-A-T.",
        ]
      : [
          "Add explicit Q&A blocks targeting this query — Gemini extracts directly from these.",
          "Earn a citation on a domain Gemini already trusts (see the cited sources list).",
          "Implement Article + Organization JSON-LD with sameAs links to authoritative profiles.",
        ];

    return {
      key: "gemini",
      label: "Google Gemini",
      type: "AEO",
      score,
      note: cited
        ? "Cited as a source in Google's AI Overview"
        : "AI Overview present but your domain is not cited",
      details: {
        summary: `Google's AI Overview cites ${sources.length} source${sources.length === 1 ? "" : "s"} for this query.`,
        yourPosition: cited
          ? `${domain} is cited at position #${citedIdx + 1}`
          : `${domain} is NOT cited — competitors own this answer`,
        evidence,
        dataPoints,
        competitors,
        recommendations,
        rawCount: sources.length,
      },
    };
  } catch (e) {
    console.error("gemini analyze failed", e);
    return {
      key: "gemini",
      label: "Google Gemini",
      type: "AEO",
      score: 0,
      note: "Lookup failed",
      details: emptyDetails(),
    };
  }
}

async function perplexityCite(query: string): Promise<{ citations: string[]; content: string }> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY not configured");
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: "You are a research assistant. Answer concisely with sources." },
        { role: "user", content: query },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Perplexity ${res.status}`);
  const data: any = await res.json();
  return {
    citations: (data.citations as string[]) || [],
    content: (data.choices?.[0]?.message?.content as string) || "",
  };
}

function citationsToEvidence(citations: string[], limit = 5): EvidenceItem[] {
  return citations
    .slice(0, limit)
    .map((c, i) => ({ title: hostOf(c), url: c, meta: `Cited source #${i + 1}` }));
}

function freshnessSignal(citations: string[]): string {
  const yearRx = /(20\d{2})/g;
  const years: number[] = [];
  for (const c of citations) {
    const matches = c.match(yearRx);
    if (matches) years.push(...matches.map(Number));
  }
  if (years.length === 0) return "No date signals";
  const max = Math.max(...years);
  return `Most recent: ${max}`;
}

async function analyzePerplexity(query: string, domain: string): Promise<EngineResult> {
  try {
    const { citations, content } = await perplexityCite(query);
    const evidence = citationsToEvidence(citations, 5);
    const idx = citations.findIndex((c) => c.toLowerCase().includes(domain.toLowerCase()));
    const mentioned = content.toLowerCase().includes(domain.toLowerCase());
    const httpsShare = citations.length
      ? Math.round(
          (citations.filter((c) => c.startsWith("https://")).length / citations.length) * 100,
        )
      : 0;
    const uniqueHosts = new Set(citations.map(hostOf));
    const competitors: CompetitorRow[] = citations
      .slice(0, 5)
      .filter((c) => !c.toLowerCase().includes(domain.toLowerCase()))
      .slice(0, 5)
      .map((c, i) => ({
        domain: hostOf(c),
        position: `Cited #${citations.indexOf(c) + 1}`,
        source: "Perplexity",
      }));

    let score = 18;
    let note = `Not in the ${citations.length} cited sources`;
    let yourPosition = `${domain} is NOT cited — these competitors are`;
    if (idx >= 0) {
      score = Math.max(60, 95 - idx * 6);
      note = `Cited as source #${idx + 1} of ${citations.length}`;
      yourPosition = `${domain} is cited as source #${idx + 1}`;
    } else if (mentioned) {
      score = 45;
      note = "Mentioned in answer body but not in citations";
      yourPosition = `${domain} is mentioned in the answer text but not cited`;
    }

    const dataPoints: DataPoint[] = [
      {
        label: "Citation rank",
        value: idx >= 0 ? `#${idx + 1}` : "Not cited",
        status: idx >= 0 ? "good" : "bad",
      },
      { label: "Total citations", value: `${citations.length}`, status: "info" },
      { label: "Unique citation domains", value: `${uniqueHosts.size}`, status: "info" },
      { label: "HTTPS share", value: `${httpsShare}%`, status: httpsShare >= 90 ? "good" : "ok" },
      {
        label: "Mentioned in body",
        value: mentioned ? "Yes" : "No",
        status: mentioned ? "ok" : "bad",
      },
      { label: "Answer length", value: `${content.length} chars`, status: "info" },
      { label: "Freshness signal", value: freshnessSignal(citations), status: "info" },
      {
        label: "Top cited domain",
        value: citations[0] ? hostOf(citations[0]) : "—",
        status: "info",
      },
    ];

    const recommendations: string[] =
      idx >= 0
        ? [
            "You're cited — protect the position with quarterly content refreshes and additional inbound citations.",
          ]
        : [
            "Get listed on the domains Perplexity already cites for this query (see the citation list).",
            "Publish a comparison or 'best of' page — Perplexity disproportionately cites listicles and comparison content.",
            "Add clear, numbered claims with inline sources — Perplexity prefers content that mirrors its own format.",
          ];

    return {
      key: "perplexity",
      label: "Perplexity",
      type: "AEO",
      score,
      note,
      details: {
        summary: `Perplexity grounded its answer with ${citations.length} citation${citations.length === 1 ? "" : "s"}.`,
        yourPosition,
        evidence,
        dataPoints,
        competitors,
        recommendations,
        rawCount: citations.length,
      },
    };
  } catch (e) {
    console.error("perplexity analyze failed", e);
    return {
      key: "perplexity",
      label: "Perplexity",
      type: "AEO",
      score: 0,
      note: "Lookup failed",
      details: emptyDetails(),
    };
  }
}

async function analyzeChatGPT(query: string, domain: string): Promise<EngineResult> {
  try {
    const { citations, content } = await perplexityCite(`${query} (latest reputable sources)`);
    const evidence = citationsToEvidence(citations, 5);
    const idx = citations.findIndex((c) => c.toLowerCase().includes(domain.toLowerCase()));
    const cited = idx >= 0;
    const mentioned = content.toLowerCase().includes(domain.toLowerCase());
    const uniqueHosts = new Set(citations.map(hostOf));
    const competitors: CompetitorRow[] = citations
      .slice(0, 5)
      .filter((c) => !c.toLowerCase().includes(domain.toLowerCase()))
      .slice(0, 3)
      .map((c) => ({
        domain: hostOf(c),
        position: `Retrieved #${citations.indexOf(c) + 1}`,
        source: "ChatGPT (browse)",
      }));

    let score = 20;
    let note = "Not surfaced in grounded retrieval for this query";
    let yourPosition = `${domain} is NOT a retrieval candidate — competitors own this`;
    if (cited) {
      score = Math.max(70, 90 - idx * 4);
      note = "Likely surfaced via web-browse mode (cited proxy)";
      yourPosition = `${domain} appears in retrieval candidates at #${idx + 1}`;
    } else if (mentioned) {
      score = 42;
      note = "Brand mention without citation — weak retrieval signal";
      yourPosition = `${domain} mentioned in text but not retrieved as a source`;
    }

    const dataPoints: DataPoint[] = [
      {
        label: "Retrieval rank",
        value: cited ? `#${idx + 1}` : "Not retrieved",
        status: cited ? "good" : "bad",
      },
      { label: "Candidate sources", value: `${citations.length}`, status: "info" },
      { label: "Unique source domains", value: `${uniqueHosts.size}`, status: "info" },
      {
        label: "Brand mention in body",
        value: mentioned ? "Yes" : "No",
        status: mentioned ? "ok" : "bad",
      },
      { label: "Freshness signal", value: freshnessSignal(citations), status: "info" },
      {
        label: "Top retrieved domain",
        value: citations[0] ? hostOf(citations[0]) : "—",
        status: "info",
      },
      { label: "Answer length", value: `${content.length} chars`, status: "info" },
    ];

    const recommendations: string[] = cited
      ? [
          "Maintain inbound links from the other cited domains to reinforce ChatGPT's retrieval graph.",
        ]
      : [
          "ChatGPT browse heavily uses Bing's index — fix your Bing visibility first to flow into ChatGPT.",
          "Earn coverage on the domains currently retrieved (PR + guest posts + listings).",
          "Add llms.txt and clean robots rules to ensure ChatGPT can actually crawl your content.",
        ];

    return {
      key: "chatgpt",
      label: "ChatGPT",
      type: "AEO",
      score,
      note,
      details: {
        summary: `ChatGPT browse-mode is proxied via grounded retrieval — ${citations.length} candidate source${citations.length === 1 ? "" : "s"} found.`,
        yourPosition,
        evidence,
        dataPoints,
        competitors,
        recommendations,
        rawCount: citations.length,
      },
    };
  } catch (e) {
    console.error("chatgpt analyze failed", e);
    return {
      key: "chatgpt",
      label: "ChatGPT",
      type: "AEO",
      score: 0,
      note: "Lookup failed",
      details: emptyDetails(),
    };
  }
}

// ---------- Gap Analysis ----------

function buildGapAnalysis(results: EngineResult[]): GapAnalysis {
  const aeo = results.filter((r) => r.type === "AEO");
  const seo = results.filter((r) => r.type === "SEO");
  const aeoScore = aeo.length ? Math.round(aeo.reduce((a, r) => a + r.score, 0) / aeo.length) : 0;
  const seoScore = seo.length ? Math.round(seo.reduce((a, r) => a + r.score, 0) / seo.length) : 0;
  const overallScore = Math.round(aeoScore * 0.6 + seoScore * 0.4);

  // Top competitors aggregated across engines
  const counts = new Map<string, { count: number; engines: Set<string> }>();
  for (const r of results) {
    for (const c of r.details.competitors) {
      if (!c.domain) continue;
      const cur = counts.get(c.domain) || { count: 0, engines: new Set<string>() };
      cur.count += 1;
      cur.engines.add(r.label);
      counts.set(c.domain, cur);
    }
  }
  const topCompetitors = Array.from(counts.entries())
    .map(([domain, v]) => ({ domain, appearances: v.count, engines: Array.from(v.engines) }))
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, 5);

  // Missing features per engine (data points marked bad)
  const missingFeatures: GapAnalysis["missingFeatures"] = [];
  for (const r of results) {
    for (const dp of r.details.dataPoints) {
      if (dp.status === "bad") {
        missingFeatures.push({
          feature: dp.label,
          engine: r.label,
          impact: r.type === "AEO" ? "high" : "medium",
        });
      }
    }
  }

  // Quick wins — collect, dedupe, prioritize
  const seen = new Set<string>();
  const quickWins: GapAnalysis["quickWins"] = [];
  for (const r of results) {
    for (const rec of r.details.recommendations) {
      if (seen.has(rec)) continue;
      seen.add(rec);
      const priority: 1 | 2 | 3 = r.type === "AEO" && r.score < 40 ? 1 : r.score < 50 ? 2 : 3;
      quickWins.push({
        action: rec,
        rationale: `From ${r.label} analysis (score ${r.score})`,
        priority,
      });
    }
  }
  quickWins.sort((a, b) => a.priority - b.priority);

  const totalDataPoints = results.reduce((a, r) => a + r.details.dataPoints.length, 0);

  return {
    aeoScore,
    seoScore,
    overallScore,
    topCompetitors,
    missingFeatures: missingFeatures.slice(0, 12),
    quickWins: quickWins.slice(0, 8),
    totalDataPoints,
  };
}

// ---------- Server functions ----------

export const analyzeVisibility = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const keyword = data.keyword.trim();
    const domain = extractDomain(data.website) ?? data.website.trim();

    const [google, bing, perplexity, chatgpt, gemini] = await Promise.all([
      analyzeGoogle(keyword, domain),
      analyzeBing(keyword, domain),
      analyzePerplexity(keyword, domain),
      analyzeChatGPT(keyword, domain),
      analyzeGemini(keyword, domain),
    ]);

    const results: EngineResult[] = [google, bing, perplexity, chatgpt, gemini];
    const gapAnalysis = buildGapAnalysis(results);
    return { results, domain, keyword, gapAnalysis };
  });

const leadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  target: z.string().min(1).max(300),
  snapshot: z.any().optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    // Use the anon client (RLS policy "Anyone can submit a lead" permits this).
    // This avoids a hard dependency on SUPABASE_SERVICE_ROLE_KEY, which is not
    // present on Vercel by default — keeping lead capture working in production.
    const { data: inserted, error } = await supabaseAnonServer
      .from("leads")
      .insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        target: data.target,
        snapshot: data.snapshot ?? null,
      })
      .select("id")
      .single();
    if (error) {
      console.error("lead insert failed", error);
      return { ok: false, error: "Could not save your request. Please try again." };
    }
    // Return the row id so the funnel can attach the generated article to it.
    return { ok: true, leadId: inserted?.id ?? null };
  });

// Attach the generated article to an existing lead row (called after Claude
// finishes). Best-effort — failure here never blocks the user's experience.
const attachArticleInput = z.object({
  leadId: z.string().uuid(),
  article: z.any(),
});

export const attachArticleToLead = createServerFn({ method: "POST" })
  .inputValidator((d) => attachArticleInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const { error } = await supabaseAnonServer
      .from("leads")
      .update({ article: data.article ?? null })
      .eq("id", data.leadId);
    if (error) {
      console.error("attach article failed", error);
      return { ok: false, error: "Could not save the article to the lead." };
    }
    return { ok: true };
  });

// ---------- Admin: list leads (token-protected) ----------

export type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  target: string;
  // Serialized as JSON strings to satisfy the server-fn serializer; the client
  // parses them. Use parseLeadRow() to get structured data.
  snapshotJson: string | null;
  articleJson: string | null;
};

export type ParsedLead = Omit<LeadRow, "snapshotJson" | "articleJson"> & {
  snapshot: Record<string, unknown> | null;
  article: GeneratedArticle | null;
};

export function parseLeadRow(row: LeadRow): ParsedLead {
  const safeParse = <T>(s: string | null): T | null => {
    if (!s) return null;
    try {
      return JSON.parse(s) as T;
    } catch {
      return null;
    }
  };
  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name,
    email: row.email,
    target: row.target,
    snapshot: safeParse<Record<string, unknown>>(row.snapshotJson),
    article: safeParse<GeneratedArticle>(row.articleJson),
  };
}

const listLeadsInput = z.object({
  token: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(500).optional().default(200),
});

export const listLeads = createServerFn({ method: "POST" })
  .inputValidator((d) => listLeadsInput.parse(d))
  .handler(
    async ({ data }): Promise<{ ok: true; leads: LeadRow[] } | { ok: false; error: string }> => {
      // Gate behind a server-side admin token. Set ADMIN_TOKEN in your host env.
      const expected = process.env.ADMIN_TOKEN;
      if (!expected) {
        return { ok: false, error: "Admin access is not configured (set ADMIN_TOKEN)." };
      }
      if (data.token !== expected) {
        return { ok: false, error: "Incorrect access code." };
      }
      // Reading all rows requires bypassing RLS → use the service-role client.
      // (Only this admin-token-gated path needs SUPABASE_SERVICE_ROLE_KEY.)
      try {
        const { data: rows, error } = await supabaseAdmin
          .from("leads")
          .select("id, created_at, name, email, target, snapshot, article")
          .order("created_at", { ascending: false })
          .limit(data.limit);
        if (error) {
          console.error("listLeads failed", error);
          return { ok: false, error: "Could not load leads." };
        }
        const leads: LeadRow[] = (rows ?? []).map((r) => ({
          id: r.id,
          created_at: r.created_at,
          name: r.name,
          email: r.email,
          target: r.target,
          snapshotJson: r.snapshot != null ? JSON.stringify(r.snapshot) : null,
          articleJson: r.article != null ? JSON.stringify(r.article) : null,
        }));
        return { ok: true, leads };
      } catch (e) {
        console.error("listLeads error", e);
        return {
          ok: false,
          error:
            e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
              ? "Admin reads need SUPABASE_SERVICE_ROLE_KEY set in your host environment."
              : "Could not load leads.",
        };
      }
    },
  );

// ---------- Free article generator (Claude) ----------

export type ArticleSection = {
  h2: string;
  intro: string;
  subsections: { h3: string; body: string }[];
};

export type GeneratedArticle = {
  title: string;
  metaDescription: string;
  readTimeMinutes: number;
  heroAlt: string;
  keyTakeaways: string[];
  tableOfContents: string[];
  sections: ArticleSection[];
  faqs: { q: string; a: string }[];
  cta: { headline: string; body: string; buttonText: string };
};

const articleInput = z.object({
  brand: z.string().min(1).max(200),
  domain: z.string().min(1).max(200),
  city: z.string().max(120).optional().default(""),
  sector: z.string().min(1).max(120),
  services: z.array(z.string()).max(20).optional().default([]),
  priorityKeyword: z.string().max(200).optional().default(""),
});

export const generateFreeArticle = createServerFn({ method: "POST" })
  .inputValidator((data) => articleInput.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; article: GeneratedArticle } | { ok: false; error: string }> => {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) return { ok: false, error: "Article generator not configured." };

      const cityPart = data.city ? ` in ${data.city}` : "";
      const kw = data.priorityKeyword || `${data.sector} services${cityPart}`;
      const servicesList = data.services.length ? data.services.join(", ") : "core services";

      const prompt = `You are a senior SEO content strategist writing a definitive, comprehensive, AEO-optimized pillar article for a real local business.

BUSINESS PROFILE
- Brand: ${data.brand}
- Domain: ${data.domain}
- Sector: ${data.sector}
- Service area: ${data.city || "local market"}
- Services offered: ${servicesList}
- Target primary keyword: "${kw}"

WRITE A 1,800–2,400 WORD ARTICLE structured exactly like a top-ranking 2026 pillar guide:
- Expert, authoritative, helpful tone (E-E-A-T). Mention real codes, permits, materials, costs, or processes for ${data.sector}.
- Primary keyword appears naturally in the title, intro, and 3–5 H2s.
- 5 crisp Key Takeaways bullets.
- Table of Contents list (just the H2 titles).
- 5 to 6 H2 sections. Each H2 has a 2–3 sentence intro and exactly 2 H3 subsections with rich body copy (90–160 words each).
- 5 FAQs targeting "People Also Ask" intent (2–4 sentence answers).
- Closing CTA block specific to ${data.brand}.

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:

{
  "title": "string",
  "metaDescription": "string under 160 chars",
  "readTimeMinutes": number,
  "heroAlt": "string",
  "keyTakeaways": ["string","string","string","string","string"],
  "tableOfContents": ["H2 title"],
  "sections": [
    { "h2": "string", "intro": "string",
      "subsections": [{ "h3": "string", "body": "string" },{ "h3": "string", "body": "string" }] }
  ],
  "faqs": [{ "q": "string", "a": "string" }],
  "cta": { "headline": "string", "body": "string", "buttonText": "string" }
}`;

      try {
        // Guard the Claude call with a timeout so a slow response returns a
        // clean error instead of letting the serverless function hard-timeout
        // (which left the UI stuck on "Finalizing…"). Kept under the function's
        // maxDuration (60s) so our handler wins the race and can respond.
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 55000);
        let res: Response;
        try {
          res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": key,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-5-20250929",
              max_tokens: 6000,
              messages: [{ role: "user", content: prompt }],
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
        if (!res.ok) {
          const text = await res.text();
          console.error("anthropic error", res.status, text);
          return { ok: false, error: `Claude API ${res.status}` };
        }
        const json = (await res.json()) as { content?: { type: string; text?: string }[] };
        const text = (json.content || []).map((p) => p.text || "").join("");
        const m = text.match(/\{[\s\S]*\}/);
        if (!m) return { ok: false, error: "No JSON in Claude response." };
        const article = JSON.parse(m[0]) as GeneratedArticle;
        return { ok: true, article };
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          console.error("generateFreeArticle timed out");
          return { ok: false, error: "Article generation timed out. Please try again." };
        }
        console.error("generateFreeArticle failed", e);
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
      }
    },
  );

// ============================================================================
// CMS DETECTION + DIRECT-PUBLISH
// ============================================================================

export type CmsPlatform =
  | "wordpress" // self-hosted WP (or unknown WP flavor)
  | "wordpress_com" // hosted on wordpress.com
  | "shopify"
  | "webflow"
  | "wix"
  | "squarespace"
  | "ghost"
  | "hubspot"
  | "drupal"
  | "joomla"
  | "duda"
  | "framer"
  | "unknown";

export type CmsDetection = {
  platform: CmsPlatform;
  label: string; // user-facing
  confidence: "high" | "medium" | "low";
  signals: string[]; // why we think this
  publishMode: "native" | "manual"; // native = we can post directly; manual = download/paste
  publishUrl?: string; // e.g. https://site.com/wp-json/wp/v2/posts
  instructions?: string; // shown to user for manual mode
};

function safeUrl(input: string): URL | null {
  try {
    const u = input.startsWith("http") ? input : `https://${input}`;
    const url = new URL(u);
    // Basic SSRF guard: the publish/detect endpoints fetch arbitrary user URLs
    // server-side, so block obvious internal/private targets and non-web schemes.
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    const isPrivate =
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    if (isPrivate) return null;
    return url;
  } catch {
    return null;
  }
}

export const detectCms = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ url: z.string().min(3).max(500) }).parse(d))
  .handler(async ({ data }): Promise<CmsDetection> => {
    const u = safeUrl(data.url);
    if (!u) {
      return {
        platform: "unknown",
        label: "Unknown",
        confidence: "low",
        signals: ["Invalid URL"],
        publishMode: "manual",
      };
    }

    let html = "";
    let headers: Headers | null = null;
    try {
      const res = await fetch(u.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 Vector.SEO CMS-Detector/1.0" },
        redirect: "follow",
      });
      headers = res.headers;
      html = (await res.text()).slice(0, 200_000);
    } catch (e) {
      return {
        platform: "unknown",
        label: "Unknown (couldn't fetch site)",
        confidence: "low",
        signals: [`Fetch failed: ${e instanceof Error ? e.message : "network error"}`],
        publishMode: "manual",
      };
    }

    const lower = html.toLowerCase();
    const generator =
      lower.match(/<meta\s+name=["']generator["']\s+content=["']([^"']+)["']/)?.[1] || "";
    const xPoweredBy = headers?.get("x-powered-by") || "";
    const server = headers?.get("server") || "";
    const signals: string[] = [];
    const pushSig = (s: string) => {
      if (s) signals.push(s);
    };

    // Shopify
    if (
      lower.includes("cdn.shopify.com") ||
      lower.includes("shopify.theme") ||
      /myshopify\.com/.test(lower)
    ) {
      pushSig("Detected cdn.shopify.com / Shopify theme assets");
      return {
        platform: "shopify",
        label: "Shopify",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Shopify admin go to Online Store → Blog posts → Add blog post. Paste the HTML using the HTML view (<> button in the editor).",
      };
    }

    // Webflow
    if (
      lower.includes("data-wf-site") ||
      lower.includes("webflow.com") ||
      generator.toLowerCase().includes("webflow")
    ) {
      pushSig("Detected data-wf-site / Webflow generator");
      return {
        platform: "webflow",
        label: "Webflow",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Webflow Designer open your CMS Collection (Blog Posts) → New Item → paste the HTML into a Rich Text field via the HTML embed.",
      };
    }

    // Wix
    if (
      lower.includes("wix.com") ||
      lower.includes("wixstatic.com") ||
      /x-wix-/.test(JSON.stringify([...(headers?.entries() || [])]).toLowerCase())
    ) {
      pushSig("Detected wixstatic.com / Wix headers");
      return {
        platform: "wix",
        label: "Wix",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Wix dashboard → Blog → Create New Post → switch to HTML view and paste the article.",
      };
    }

    // Squarespace
    if (
      lower.includes("static1.squarespace.com") ||
      lower.includes("squarespace.com") ||
      generator.toLowerCase().includes("squarespace")
    ) {
      pushSig("Detected Squarespace assets / generator");
      return {
        platform: "squarespace",
        label: "Squarespace",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Squarespace go to Pages → Blog → + Add Post → use a Code block to paste the HTML.",
      };
    }

    // Ghost
    if (generator.toLowerCase().includes("ghost") || lower.includes('content="ghost')) {
      pushSig("Detected Ghost generator meta");
      return {
        platform: "ghost",
        label: "Ghost",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Ghost admin → Posts → New post → use the HTML card (Ctrl/⌘+/) to paste the article.",
      };
    }

    // HubSpot
    if (lower.includes("hs-scripts.com") || lower.includes("hubspot")) {
      pushSig("Detected HubSpot script");
      return {
        platform: "hubspot",
        label: "HubSpot CMS",
        confidence: "medium",
        signals,
        publishMode: "manual",
        instructions:
          "In HubSpot → Marketing → Website → Blog → Create Blog Post → use the Source HTML view to paste.",
      };
    }

    // Drupal
    if (xPoweredBy.toLowerCase().includes("drupal") || generator.toLowerCase().includes("drupal")) {
      pushSig("Detected Drupal generator/header");
      return {
        platform: "drupal",
        label: "Drupal",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Drupal admin → Content → Add Content → Article → switch text format to Full HTML and paste.",
      };
    }

    // Joomla
    if (generator.toLowerCase().includes("joomla")) {
      pushSig("Detected Joomla generator");
      return {
        platform: "joomla",
        label: "Joomla",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Joomla admin → Content → Articles → New → toggle the editor to source code mode and paste.",
      };
    }

    // Duda
    if (lower.includes("dudaone") || lower.includes("duda.co")) {
      pushSig("Detected Duda assets");
      return {
        platform: "duda",
        label: "Duda",
        confidence: "medium",
        signals,
        publishMode: "manual",
        instructions:
          "In Duda editor open the Blog app → New post → paste HTML in the source view.",
      };
    }

    // Framer
    if (lower.includes("framerusercontent.com") || generator.toLowerCase().includes("framer")) {
      pushSig("Detected Framer assets");
      return {
        platform: "framer",
        label: "Framer",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "In Framer open your CMS Collection → New entry → paste HTML into a Rich Text field.",
      };
    }

    // WordPress.com (hosted)
    if (u.hostname.endsWith(".wordpress.com")) {
      pushSig("Hostname ends in .wordpress.com");
      return {
        platform: "wordpress_com",
        label: "WordPress.com (hosted)",
        confidence: "high",
        signals,
        publishMode: "manual",
        instructions:
          "WordPress.com hosted sites: in your dashboard go to Posts → Add New → switch to the HTML/Code editor and paste.",
      };
    }

    // WordPress (self-hosted) — we can publish directly via REST + App Password
    const wpHints =
      lower.includes("/wp-content/") ||
      lower.includes("/wp-includes/") ||
      lower.includes("wp-json") ||
      generator.toLowerCase().includes("wordpress");
    if (wpHints) {
      if (lower.includes("/wp-content/")) pushSig("Detected /wp-content/ assets");
      if (lower.includes("/wp-includes/")) pushSig("Detected /wp-includes/ assets");
      if (generator.toLowerCase().includes("wordpress")) pushSig(`Generator meta: ${generator}`);

      // Try to confirm REST is reachable
      let restOk = false;
      try {
        const probe = await fetch(`${u.origin}/wp-json/`, { method: "GET" });
        restOk = probe.ok;
        if (restOk) pushSig("WordPress REST API reachable at /wp-json/");
      } catch {
        /* ignore */
      }

      return {
        platform: "wordpress",
        label: "WordPress",
        confidence: "high",
        signals,
        publishMode: restOk ? "native" : "manual",
        publishUrl: `${u.origin}/wp-json/wp/v2/posts`,
        instructions: restOk
          ? undefined
          : "We detected WordPress but couldn't reach /wp-json/. Ask your developer to enable the REST API, or paste the HTML in Posts → Add New → Code editor.",
      };
    }

    return {
      platform: "unknown",
      label: "Custom / Unknown platform",
      confidence: "low",
      signals: [generator ? `Generator: ${generator}` : "No CMS fingerprint found"],
      publishMode: "manual",
      instructions:
        "We couldn't auto-detect your CMS. Download the article as HTML and paste it into a new post on your platform.",
    };
  });

// ---- HTML serialization (shared between publish + download) ----

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function articleToHtml(article: GeneratedArticle): string {
  const lines: string[] = [];
  lines.push(`<h1>${escapeHtml(article.title)}</h1>`);
  if (article.metaDescription) {
    lines.push(`<p><em>${escapeHtml(article.metaDescription)}</em></p>`);
  }

  if (article.keyTakeaways?.length) {
    lines.push(`<h2>Key Takeaways</h2>`);
    lines.push(`<ul>`);
    article.keyTakeaways.forEach((k) => lines.push(`  <li>${escapeHtml(k)}</li>`));
    lines.push(`</ul>`);
  }

  if (article.tableOfContents?.length) {
    lines.push(`<h2>Table of Contents</h2>`);
    lines.push(`<ol>`);
    article.tableOfContents.forEach((t) => lines.push(`  <li>${escapeHtml(t)}</li>`));
    lines.push(`</ol>`);
  }

  article.sections?.forEach((s) => {
    lines.push(`<h2>${escapeHtml(s.h2)}</h2>`);
    if (s.intro) lines.push(`<p>${escapeHtml(s.intro)}</p>`);
    s.subsections?.forEach((ss) => {
      lines.push(`<h3>${escapeHtml(ss.h3)}</h3>`);
      lines.push(`<p>${escapeHtml(ss.body)}</p>`);
    });
  });

  if (article.faqs?.length) {
    lines.push(`<h2>Frequently Asked Questions</h2>`);
    article.faqs.forEach((f) => {
      lines.push(`<h3>${escapeHtml(f.q)}</h3>`);
      lines.push(`<p>${escapeHtml(f.a)}</p>`);
    });
  }

  if (article.cta) {
    lines.push(`<h2>${escapeHtml(article.cta.headline)}</h2>`);
    lines.push(`<p>${escapeHtml(article.cta.body)}</p>`);
  }

  return lines.join("\n");
}

// ============================================================================
// EMAIL DELIVERY (Resend)
// ============================================================================
// Sends the generated article to the lead, and an optional internal
// notification to the business owner. Degrades gracefully: if RESEND_API_KEY is
// not configured, it returns { ok: false, skipped: true } instead of throwing,
// so the funnel never breaks just because email isn't set up yet.
//
// Required env vars (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   — your Resend API key (re_...)
//   LEAD_FROM_EMAIL  — verified sender, e.g. "Vector.SEO <hello@yourdomain.com>"
// Optional:
//   LEAD_NOTIFY_EMAIL — where to send a copy of each new lead (your inbox)

async function resendSend(payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("resend send failed", res.status, text);
      let msg = `Resend returned ${res.status}.`;
      try {
        const j = JSON.parse(text);
        if (j?.message) msg = j.message;
      } catch {
        /* ignore */
      }
      return { ok: false, error: msg };
    }
    const j = JSON.parse(text) as { id?: string };
    return { ok: true, id: j.id };
  } catch (e) {
    console.error("resend send error", e);
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

function articleEmailHtml(article: GeneratedArticle, brand: string, domain: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e4e4e7;">
        <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#10b981;font-weight:700;">Your free SEO article</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;">${escapeHtml(article.title)}</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#52525b;">Custom-written for <strong>${escapeHtml(brand)}</strong> · ${article.readTimeMinutes} min read · ready to publish on ${escapeHtml(domain)}.</p>
        <div style="font-size:15px;line-height:1.6;color:#27272a;">
          ${articleToHtml(article)}
        </div>
        <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0;" />
        <p style="font-size:13px;color:#71717a;margin:0;">This article was generated by Vector.SEO. Reply to this email and we'll help you get it live and start ranking ${escapeHtml(brand)} across Google, ChatGPT, Perplexity and more.</p>
      </div>
      <p style="text-align:center;font-size:11px;color:#a1a1aa;margin:16px 0 0;">© ${new Date().getFullYear()} Vector.SEO · Built for local contractors.</p>
    </div>
  </body>
</html>`;
}

const sendArticleInput = z.object({
  toEmail: z.string().email().max(320),
  name: z.string().max(200).optional().default(""),
  brand: z.string().max(200).optional().default("your business"),
  domain: z.string().max(200).optional().default(""),
  snapshot: z.any().optional(),
  article: z.any(),
});

// Where new-lead notifications go. Defaults to monty@acadium.com; override with
// the LEAD_NOTIFY_EMAIL env var if needed.
const DEFAULT_NOTIFY_EMAIL = "monty@acadium.com";

export const sendArticleEmail = createServerFn({ method: "POST" })
  .inputValidator((d) => sendArticleInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; skipped?: boolean; error?: string }> => {
    const article = data.article as GeneratedArticle;
    if (!article?.title) return { ok: false, error: "Article is empty." };

    const from = process.env.LEAD_FROM_EMAIL || "Vector.SEO <onboarding@resend.dev>";
    const notify = process.env.LEAD_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL;

    if (!process.env.RESEND_API_KEY) {
      // Not configured yet — don't break the funnel.
      return { ok: false, skipped: true, error: "Email not configured." };
    }

    // 1) Send the article to the lead.
    const toLead = await resendSend({
      from,
      to: data.toEmail,
      subject: `Your free SEO article: ${article.title}`,
      html: articleEmailHtml(article, data.brand, data.domain),
      reply_to: notify,
    });

    // 2) Internal notification with the FULL lead + generated article so you
    //    have everything in your inbox even before opening the dashboard.
    const snap = (data.snapshot ?? {}) as Record<string, unknown>;
    const fmtList = (v: unknown) => (Array.isArray(v) && v.length ? escapeHtml(v.join(", ")) : "—");
    await resendSend({
      from,
      to: notify,
      subject: `New lead: ${data.name || data.toEmail} — ${data.domain || "no domain"}`,
      html: `<h2 style="font-family:sans-serif;">New funnel lead</h2>
          <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:4px 12px 4px 0;"><strong>Name</strong></td><td>${escapeHtml(data.name || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;"><strong>Email</strong></td><td>${escapeHtml(data.toEmail)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;"><strong>Business</strong></td><td>${escapeHtml(data.brand)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;"><strong>Domain</strong></td><td>${escapeHtml(data.domain || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;"><strong>City</strong></td><td>${escapeHtml(String(snap.city || "—"))}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;"><strong>Priority</strong></td><td>${escapeHtml(String(snap.priority || "—"))}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;vertical-align:top;"><strong>Services</strong></td><td>${fmtList(snap.services)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;vertical-align:top;"><strong>Not offered</strong></td><td>${fmtList(snap.notServices)}</td></tr>
          </table>
          <h3 style="font-family:sans-serif;margin-top:24px;">Survey answers</h3>
          <pre style="font-family:monospace;font-size:12px;background:#f4f4f5;padding:12px;border-radius:8px;white-space:pre-wrap;">${escapeHtml(JSON.stringify(snap.answers ?? {}, null, 2))}</pre>
          <h3 style="font-family:sans-serif;margin-top:24px;">Generated article</h3>
          <div style="font-family:sans-serif;font-size:14px;line-height:1.6;border:1px solid #e4e4e7;border-radius:8px;padding:16px;">
            ${articleToHtml(article)}
          </div>`,
      reply_to: data.toEmail,
    });

    return toLead.ok ? { ok: true } : { ok: false, error: toLead.error };
  });

// ---- WordPress (self-hosted) direct publish ----

const wpPublishInput = z.object({
  siteUrl: z.string().min(3).max(500),
  username: z.string().min(1).max(200),
  appPassword: z.string().min(8).max(200),
  status: z.enum(["draft", "publish"]).default("draft"),
  article: z.any(),
});

export const publishToWordPress = createServerFn({ method: "POST" })
  .inputValidator((d) => wpPublishInput.parse(d))
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; postId: number; link: string; status: string } | { ok: false; error: string }
    > => {
      const u = safeUrl(data.siteUrl);
      if (!u) return { ok: false, error: "Invalid site URL." };

      const article = data.article as GeneratedArticle;
      if (!article || !article.title) return { ok: false, error: "Article is empty." };

      const endpoint = `${u.origin}/wp-json/wp/v2/posts`;
      // Application passwords use Basic auth: "username:app-password" base64
      const authToken = btoa(`${data.username}:${data.appPassword.replace(/\s+/g, "")}`);

      const body = {
        title: article.title,
        content: articleToHtml(article),
        status: data.status,
        excerpt: article.metaDescription || "",
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authToken}`,
          },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        if (!res.ok) {
          console.error("WP publish error", res.status, text);
          // common WP error shapes
          let msg = `WordPress returned ${res.status}.`;
          try {
            const j = JSON.parse(text);
            if (j?.message) msg = j.message;
            if (j?.code === "rest_cannot_create")
              msg = "This user can't create posts. Use an account with Editor or Author role.";
            if (
              j?.code === "invalid_username" ||
              j?.code === "incorrect_password" ||
              res.status === 401
            ) {
              msg = "Authentication failed. Double-check the username and Application Password.";
            }
          } catch {
            /* ignore */
          }
          return { ok: false, error: msg };
        }
        const json = JSON.parse(text) as { id: number; link: string; status: string };
        return { ok: true, postId: json.id, link: json.link, status: json.status };
      } catch (e) {
        console.error("WP publish failed", e);
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Network error while publishing.",
        };
      }
    },
  );
