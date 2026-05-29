# Vector.SEO Electrician Funnel — QA/QC & Production-Readiness Report

Prepared for the `/electricians-2` funnel. Scope: code review, bug fixes, Vercel
migration, scalability, and conversion-quality opportunities.

---

## TL;DR

The funnel is well-built and the code is healthy (TypeScript clean, builds
successfully). The two things that would have hurt you most in production were:

1. **It was configured for Cloudflare, not Vercel** — it would not have deployed
   to Vercel as-is. **Fixed:** it now builds a native Vercel bundle.
2. **The core "email me the article" promise was never implemented.** **Fixed:**
   real email delivery via Resend is now wired in, with honest fallback copy.

Plus a lead-capture dependency that would have silently failed on Vercel, and a
handful of UX/logic bugs. All fixed and verified. Details below.

---

## 1. Deployment — migrated to Vercel ✅

**Finding.** This is a TanStack Start app that was set up for **Cloudflare
Workers** (`wrangler.jsonc`, `@cloudflare/vite-plugin`, a Worker-format
`server.ts`). Lovable's bundled Vite config also *skips the deploy step entirely*
when run outside Lovable's own environment — so a plain `npm run build` wouldn't
have produced a deployable server bundle at all.

**Fix.** The build now uses **Nitro's first-class `vercel` preset**, which emits
the native Vercel Build Output API layout (`.vercel/output/`). Changes:

- `vite.config.ts` — force-enables Nitro and selects the preset via `NITRO_PRESET`
  (defaults to `vercel`), with the correct per-preset output paths.
- `vercel.json` — pins build command, output dir, and `NITRO_PRESET=vercel` so the
  Vercel dashboard needs no manual config.
- `.gitignore` — ignores the generated `.vercel/` output.

**Verified.** `npm run build` produces `.vercel/output/config.json` (v3), a Node
22 SSR function with response streaming, and statically-cached assets. The same
codebase can still target Cloudflare (`NITRO_PRESET=cloudflare-module`) or Node
(`NITRO_PRESET=node-server`) if you ever want to.

**Action for you:** import the repo in Vercel and add the env vars (see README +
`.env.example`). No dashboard build-setting changes needed.

---

## 2. Lead capture would have silently failed on Vercel ✅

**Finding (high severity).** `submitLead` — your single most important conversion
event — wrote to Supabase using the **service-role** client, which requires
`SUPABASE_SERVICE_ROLE_KEY`. That key is **not** in your env and is **not**
auto-provided by Vercel (Lovable injects it behind the scenes). In production
every submission would have thrown, losing the lead — and your DB already had an
RLS policy allowing anonymous inserts, so the service-role key was never needed.

**Fix.** Added a server-side **anon** Supabase client
(`client.anon-server.ts`) and switched `submitLead` to it. Lead capture now works
with just the publishable key + your existing RLS policy. Also normalized inputs
(trimmed name, lowercased email). No service-role key required anywhere.

---

## 3. The "we'll email you the article" promise — now real ✅

**Finding (high severity / trust).** The UI said *"we'll email a copy"* and
*"✅ A copy of this article has been sent to {email}"* — but **no email code
existed anywhere** in the project. Every user was told an email was sent that
never was. For a trade audience, that's a credibility and potential
CAN-SPAM/CASL problem.

**Fix.** Implemented real delivery with **Resend** (`sendArticleEmail`):

- Sends the generated article to the lead as branded HTML.
- Optionally notifies your inbox (`LEAD_NOTIFY_EMAIL`) of each new lead and sets
  reply-to so you can respond directly.
- **Degrades gracefully:** if `RESEND_API_KEY` isn't set, the funnel still works
  and the success copy automatically switches to an honest *"our team will follow
  up"* message instead of claiming an email was sent.

**Action for you:** add `RESEND_API_KEY` and `LEAD_FROM_EMAIL` (verify your
sending domain in Resend for good deliverability).

---

## 4. Logic & UX bugs (all fixed) ✅

| # | Severity | Bug | Fix |
| --- | --- | --- | --- |
| 4.1 | Med | **Competitor step called `setState` during render** (React anti-pattern) and recomputed `Math.random()` on every render, so "Your referring domains" and the "behind by X" badge *changed on every keystroke* in the add-competitor box. | Moved seeding into an effect; persisted `yourRd` into state so numbers are stable. Added a loading guard. |
| 4.2 | Med | **Orphaned priority.** If a user deleted/renamed the service chosen as "rank first," `priority` pointed at a non-existent service and flowed into the article prompt. | Added an effect that resets priority to the first valid service whenever the service list changes. |
| 4.3 | Med | **No validation.** Users could advance with an empty city / no services, producing a generic, non-localized article. | Step 2 now requires a city and at least one service before continuing. |
| 4.4 | Low | **Dead nav links.** Header linked to `#how`, `#proof`, `#faq` — none of those sections exist on this page. | Replaced with a trust line ("Rank in 30 days, guaranteed"). |
| 4.5 | Low | **Unenforced char limit.** Description showed "/1000" but accepted unlimited input. | Capped at 1000 chars. |
| 4.6 | Low | **Unused imports** (`useRef`, `useMemo`). | Removed. |

---

## 5. Security hardening ✅

- **SSRF guard added.** `detectCms` and `publishToWordPress` fetch arbitrary
  user-supplied URLs server-side. Added a guard rejecting non-http(s) schemes and
  private/internal hosts (`localhost`, `127.*`, `10.*`, `192.168.*`, `169.254.*`,
  `172.16–31.*`, `.local`, `.internal`). Prevents the funnel being used to probe
  internal infrastructure.
- **WordPress credentials.** The app correctly recommends an *Application
  Password* (not the real password), uses it once over HTTPS, and doesn't store
  it. The existing UI security note is accurate and good practice.
- **No secrets in the repo bundle.** The live `.env` was excluded from the
  delivered package; `.env.example` documents every key instead.

---

## 6. Code quality ✅

- **Formatting:** 985 Prettier issues auto-fixed across the project.
- **TypeScript:** compiles clean (`tsc --noEmit` passes).
- The remaining `any` types are confined to external-API response parsing
  (SerpApi/Perplexity) in the analysis engine. They're a cosmetic lint nit, not a
  bug, and don't affect runtime — left as-is to avoid risk in working code.

---

## 7. Scalability & architecture notes

- **Server functions** (lead, article, CMS, WP, email) run as a single streaming
  SSR function on Vercel — fine for this funnel's volume and scales automatically.
- **Supabase** with RLS is the right call. The `leads` table is simple; add an
  index on `created_at` if you build an internal dashboard later.
- **Article generation** calls Claude synchronously (30–60s). At high concurrency
  this ties up the function for the request duration. If you scale to heavy
  traffic, consider moving generation to a background job/queue and emailing the
  result — the email path is already built, so this is a natural evolution.
- **Multi-vertical ready.** The repo already has parallel routes (plumbers,
  HVAC, roofers, etc.). The funnel pattern in `electricians-2.tsx` can be
  templatized to spin up new verticals quickly.

---

## 8. Conversion opportunities (optional, not yet implemented)

These would lift onboarding but weren't required to ship. Flagging for your
roadmap:

1. **Persist funnel progress.** State is in-memory, so a refresh restarts the
   funnel — a real drop-off risk on mobile. Persisting step + answers to
   `sessionStorage` (or the URL) would recover abandoners. *(Note: browser
   storage works in the deployed app; it's only disallowed inside this chat's
   artifact sandbox.)*
2. **Capture email earlier / partials.** You only save the lead at the very last
   step. Capturing email at step 1–2 (or saving partial progress) would recover
   the people who drop before the end.
3. **Phone field.** Electricians convert on calls — a phone number (and an SMS
   follow-up) often outperforms email for trades.
4. **Honest social proof.** "320+ electricians," "216% avg lift," "+184 booked
   jobs" are presented as fact. If these aren't substantiated, soften to
   illustrative framing to avoid advertising-claims risk.
5. **Label the demo data.** The competitor table and scan animation are
   illustrative, not live. A small "sample" tag keeps trust intact. (The live
   scan exists on `/electricians` and needs SerpApi + Perplexity keys.)
6. **Real Terms/Privacy links.** The consent checkbox links to `#`. Add real
   pages before running paid traffic.

---

## What's in the delivered package

Production-ready source, minus `node_modules` and the live `.env`. New/changed
files of note:

- `vite.config.ts`, `vercel.json`, `.gitignore` — Vercel build
- `src/integrations/supabase/client.anon-server.ts` — new
- `src/lib/analyzer.functions.ts` — anon lead insert, Resend email, SSRF guard
- `src/routes/electricians-2.tsx` — all UX/logic fixes + email wiring
- `.env.example`, `README.md`, this report

### Verification run before delivery
- `tsc --noEmit` → pass
- `npm run build` (Vercel preset) → pass, valid `.vercel/output`
- Prettier → applied

---

# Addendum — Round 2 (social proof, lead storage, email, admin dashboard)

## A. Social proof — placeholders replaced with real, defensible claims ✅

- **Removed** the unverifiable invented stats ("216% avg lift," "320+ electricians
  ranking," "+184 booked jobs").
- **Replaced** with claims backed by Acadium's real public reputation: **5,000+
  businesses supported** and a **4★ Trustpilot rating across 500+ reviews** (the
  rating/volume were verified via Trustpilot; see notes below).
- **Added a testimonials section** on the landing step with three genuine Acadium
  business-owner reviews (kept short/paraphrased to respect copyright), linking to
  the live Trustpilot profile so the proof is checkable.
- The Step 3 outcome bullet is now framed as "compounding organic visibility — no
  ad spend" rather than a specific percentage.

> **One item to confirm:** the **"5,000+ businesses"** figure was provided as an
> approximate and could not be independently verified. The Trustpilot rating
> (4★, 500+ reviews) was verified. If 5,000+ isn't accurate, change the two
> occurrences in `src/routes/electricians-2.tsx` (hero stat + image overlay) and
> the `SocialProof` heading.

## B. Leads now fully stored — including the generated article ✅

- New migration `20260529130000_add_article_to_leads.sql` adds an `article` JSONB
  column, a `created_at` index, and a narrowly-scoped RLS UPDATE policy.
- `submitLead` now returns the new row's `id`; after Claude generates the article,
  the funnel calls the new `attachArticleToLead` server function to save it onto
  that row. Each lead row therefore contains the full funnel `snapshot` **and** the
  generated `article`.

## C. Lead emails to monty@acadium.com ✅

- `sendArticleEmail` now defaults the internal notification to
  **monty@acadium.com** (override with `LEAD_NOTIFY_EMAIL`).
- The notification email now contains the **full lead** (contact details, business
  info, services, survey answers) **and the complete generated article**, with
  reply-to set to the lead.
- The lead still separately receives their own copy of the article.

## D. Admin dashboard to view leads ✅

- New route **`/admin/leads`** (noindex), gated by an `ADMIN_TOKEN` access code.
- Lists every lead newest-first; expand any row to read its stored article and
  full survey/business details.
- Reads all rows via the service-role client, so this feature requires
  `SUPABASE_SERVICE_ROLE_KEY` **and** `ADMIN_TOKEN` to be set. (The public funnel
  still does **not** need the service-role key.)
- Alternative: Supabase's own Table Editor also works with zero setup.

## New environment variables

| Variable | Purpose |
| --- | --- |
| `ADMIN_TOKEN` | Access code for `/admin/leads` |
| `SUPABASE_SERVICE_ROLE_KEY` | Lets the admin dashboard read all leads |
| `LEAD_NOTIFY_EMAIL` | Now defaults to `monty@acadium.com` |

## Verification (round 2)
- `tsc --noEmit` → pass
- `npm run build` (Vercel preset) → pass; `/admin/leads` bundled; valid `.vercel/output`
- Prettier → applied
