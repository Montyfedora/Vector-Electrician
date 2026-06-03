# Vector.SEO — Electrician Funnel · Project Document

> **Living document.** This is the single source of truth for the project. It is
> updated as features and changes progress. Last updated: **2026-06-02**.

---

## 1. What this is

A lead-generation funnel that attracts local contractors (currently electricians),
captures their details, generates a custom SEO pillar article with AI **live on
screen**, emails it to them, stores everything in a database, and offers package
upsells + 1-click publishing to their website.

- **Primary funnel route:** `/electricians-2`
- **Live (current) URL:** project-nbe5s.vercel.app (custom domain pending)
- **Parent brand:** Acadium (the funnel is branded "Vector.SEO" / "Vector AI")

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19 + SSR) — file-based routing |
| Build/deploy target | Nitro `vercel` preset → Vercel (Hobby plan) |
| Styling | Tailwind CSS |
| Backend logic | TanStack `createServerFn` server functions |
| Database | Supabase (Postgres + RLS) |
| AI | Anthropic Claude API (`claude-sonnet-4-5`) |
| Email | Resend |
| Images | LoremFlickr (keyword stock, no API key) w/ SVG fallback |
| Repo | github.com/Montyfedora/Vector-Electrician (branch: `main`) |

**Important build note:** the project is configured for Vercel via Nitro in
`vite.config.ts` (preset + `maxDuration: 60` baked into the function config).
Do **not** add a `functions` block to `vercel.json` — Vercel rejects the `**`
glob on this deployment type and the build fails in ~2s. (See §9 history.)

---

## 3. Environment variables

> Values live only in Vercel → Settings → Environment Variables. Share them with
> developers by granting Vercel project access, or via a password manager / one-time
> secret link — never plaintext email/Slack/docs.

| Variable | Purpose | Required for |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Lead capture |
| `SUPABASE_PUBLISHABLE_KEY` | Anon/public key | Lead capture (server) |
| `VITE_SUPABASE_URL` | Same URL, inlined into client bundle at build | Client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same anon key, inlined into client bundle | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role (bypasses RLS) | `/admin/leads` reads only |
| `ADMIN_TOKEN` | Access code for the admin dashboard | `/admin/leads` |
| `ANTHROPIC_API_KEY` | Claude API | Article generation |
| `RESEND_API_KEY` | Resend API | Email delivery |
| `LEAD_FROM_EMAIL` | Verified sender (e.g. `Vector.SEO <onboarding@resend.dev>`) | Email |
| `LEAD_NOTIFY_EMAIL` | Internal lead notifications (defaults to `monty@acadium.com`) | Email |
| `SERPAPI_KEY` | Real competitor rankings (Step 4) via SerpApi | Live competitor data |
| `STRIPE_SECRET_KEY` | Stripe API (`sk_live_…`/`sk_test_…`) | Package checkout |
| `STRIPE_PRICE_STARTER` | Stripe price ID for Starter ($297/mo) | Package checkout |
| `STRIPE_PRICE_GROWTH` | Stripe price ID for Growth ($597/mo) | Package checkout |
| `STRIPE_PRICE_DOMINATE` | Stripe price ID for Dominate ($997/mo) | Package checkout |
| `PUBLIC_SITE_URL` | (optional) base URL for Stripe success/cancel redirects | Package checkout |

Notes:
- The funnel itself does **not** need the service-role key — lead capture uses the
  anon key + RLS. Service-role is only for the admin dashboard's full-table reads.
- Supabase project is on the **new API key system** (`sb_publishable_` /
  `sb_secret_`). Use those, not legacy `eyJ...` keys, or requests 401.

### Stripe setup (package checkout)

1. In the Stripe dashboard, create **3 Products**, each with a **recurring monthly
   Price**: Starter ($297), Growth ($597), Dominate ($997).
2. Copy each **Price ID** (`price_…`) into Vercel as `STRIPE_PRICE_STARTER`,
   `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_DOMINATE`.
3. Add `STRIPE_SECRET_KEY` (test key first, then live). Optionally set
   `PUBLIC_SITE_URL` to your final domain for clean success/cancel redirects.
4. Redeploy. The package buttons will redirect to Stripe-hosted checkout.
   *(Test mode uses card 4242 4242 4242 4242.)*
   **Note:** there is no fulfilment webhook yet — successful payment redirects back
   with `?checkout=success` but does not auto-provision anything. Add a Stripe
   webhook later if you need post-payment automation.

### SerpApi setup (real competitors)

Add `SERPAPI_KEY` in Vercel. Without it, Step 4 falls back to a seeded competitor
list. Each funnel completion uses ~1 SerpApi search (watch your plan's quota).

### WordPress publishing — troubleshooting

The publish feature uses the WordPress REST API + an **Application Password**.
Common failures and fixes:
- *"Authentication failed"* → the site needs **Application Passwords** enabled
  (Users → Profile → Application Passwords in WP admin) and the user must paste
  that generated password, not their login password.
- *"This user can't create posts"* → the WP user needs **Author** or **Editor** role.
- *404 / "couldn't reach site"* → the REST API is disabled or the site isn't
  self-hosted WordPress (WordPress.com free, Wix, Squarespace, etc. won't work via
  this method — those users should use the HTML download/copy option instead).

---

## 4. Database (Supabase)

Single table: **`public.leads`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | default `gen_random_uuid()` |
| `name` | text | |
| `email` | text | normalized lowercase |
| `target` | text | "priority — city | domain" summary |
| `snapshot` | jsonb | full funnel answers (services, city, survey, competitors) |
| `article` | jsonb | `{ markdown, title }` of generated article |
| `created_at` | timestamptz | default `now()`, indexed desc |

**RLS policies** (Row Level Security):
- `"Anyone can submit a lead"` — INSERT, roles `public` *(broadened from `anon` —
  required because the new key system maps requests to `public`, not `anon`)*.
- `"Anyone can attach an article to a lead"` — UPDATE `TO public`, `article IS NULL`.
- **No SELECT policy** → public cannot read leads. Admin reads use the service-role
  key server-side.

> ⚠️ **OPEN SECURITY ITEM:** RLS is currently **DISABLED** in production as a
> temporary unblock. Must be re-enabled before real traffic. With the `TO public`
> policies in place, re-enabling RLS works correctly. See §10.

Migrations live in `supabase/migrations/`. Apply with `supabase db push` or paste
into the Supabase SQL editor in date order.

---

## 5. Routes

| Route | File | Purpose |
|---|---|---|
| `/electricians-2` | `src/routes/electricians-2.tsx` | **Primary funnel** (active) |
| `/admin/leads` | `src/routes/admin.leads.tsx` | Token-gated lead dashboard |
| `/electricians` | `src/routes/electricians.tsx` | Older funnel w/ live visibility scan |
| `/`, `/hvac`, `/plumbers`, `/roofers`, etc. | various | Other vertical variants |

---

## 6. Server functions (`src/lib/analyzer.functions.ts`)

| Function | Purpose |
|---|---|
| `submitLead` | Insert lead (anon client + RLS); returns `leadId` |
| `generateOutline` | Step 1 of article: title, hook, key takeaways, section titles, image keywords |
| `generateSection` | Step 2: generates ONE H2 section (fast, called per section) |
| `generateFaqs` | Step 3: generates 5-question FAQ section |
| `detectLocation` | Parses the user's website for the city they serve (schema.org address, address patterns, title/meta) — pre-fills city in Step 1 |
| `getCompetitors` | SerpApi: real top-ranking competitors for keyword + city (filters out Yelp/Angi/etc.) |
| `createCheckoutSession` | Creates a hosted Stripe Checkout Session for a package; returns redirect URL |
| `saveAndEmailMarkdownArticle` | Persists final markdown to lead row + emails lead & team |
| `listLeads` | Admin: returns all leads (service-role; gated by `ADMIN_TOKEN`) |
| `detectCms` | Detects a site's CMS for publish guidance |
| `publishToWordPress` | Publishes article (title + HTML) to a WP site via REST + app password |
| `markdownToHtml`, `titleFromMarkdown` | Markdown helpers (email, WP, admin) |
| `attachArticleToLead`, `generateFreeArticle`, `sendArticleEmail` | Legacy/unused — kept to avoid breakage; safe to remove later |

**Why article generation is chunked:** Vercel Hobby kills functions at 60s. A
single full-article call timed out. It's now split into outline → per-section →
FAQ calls, each well under the limit, and the client reveals each piece as it
arrives (the "written live" effect). See §9.

---

## 7. The funnel flow (`/electricians-2`)

**Navigation:** a sticky top bar (Back / Next) plus a clickable step indicator lets
users jump to any already-completed step without scrolling. Each step change
scrolls to top.

1. **Hero** — enter website URL. Real social proof (5,000+ businesses, 4★ Trustpilot).
2. **Site Scan** — animated audit. During this step, `detectLocation` analyzes the
   site and **auto-detects the city** the business serves, pre-filling Step 2.
3. **Business info** — brand, city (auto-filled, editable), services, priority.
4. **Process explainer.**
5. **Competitors** — **real** top-ranking competitors from Google (SerpApi) for the
   user's keyword + city, with a "Live Google data" badge. Falls back to a seeded
   set if `SERPAPI_KEY` isn't configured.
6. **Account + live article** — saves lead → article streams in section-by-section:
   hero image, hook, key takeaways, clickable TOC, ~4 deep sections, mid image,
   5 FAQs, author block, **JSON-LD schema**. **Capped at ~1,200 words.** On
   completion: saved to DB, emailed. Then the **publish panel** + **packages**.
7. **Packages** — Starter $297 / Growth $597 / Dominate $997 monthly. Buttons now
   create a **Stripe Checkout Session** and redirect to Stripe-hosted checkout
   (requires Stripe env vars). A scroll-triggered packages modal appears at ~50%.

---

## 8. Admin dashboard (`/admin/leads`)

- Enter `ADMIN_TOKEN` to view all leads, newest first.
- Expand any lead to see its business details, survey answers, and generated
  article (renders the stored markdown).
- Requires `SUPABASE_SERVICE_ROLE_KEY` + `ADMIN_TOKEN` set in Vercel.
- Page is `noindex`.

---

## 9. Notable engineering decisions / fixes (history)

- **Migrated Cloudflare → Vercel.** Original Lovable build targeted Cloudflare
  Workers; switched to Nitro `vercel` preset (`.vercel/output` build output API).
- **Lead capture uses anon key + RLS**, not service-role, so it works on Vercel
  without the service-role key.
- **New Supabase key system** caused 401s; fixed by using `sb_publishable_` /
  `sb_secret_` keys and broadening RLS policies to `TO public`.
- **`vercel.json` `functions` glob broke builds** (2s failures); removed. Timeout
  is set via Nitro config instead (`maxDuration: 60`).
- **Article generation chunked** to beat the 60s Hobby timeout + show live writing.
- **Article format is markdown** (was rigid JSON) — streams well, publishes to WP
  natively, simpler to store/email.
- **Images:** `source.unsplash.com` is deprecated → switched to LoremFlickr with an
  SVG fallback on load error.
- **Branding:** all user-facing "Claude.ai" → "Vector AI" (model ID/internal logs
  unchanged).

---

## 10. Open items / roadmap

| Priority | Item | Notes |
|---|---|---|
| 🔴 High | **Re-enable RLS** in Supabase | Currently OFF; exposes lead PII. `TO public` policies already work with RLS on. |
| 🟡 Med | **Stripe env vars + products** | Code is wired; needs the 4 Stripe env vars + 3 products created. No fulfilment webhook yet. |
| 🟡 Med | **SerpApi key** | Add `SERPAPI_KEY` for live competitor data; else seeded fallback. |
| 🟡 Med | **Custom domain** | Add in Vercel → Settings → Domains + DNS at registrar. |
| 🟡 Med | **Verify WordPress publish** | Needs the live error message to confirm root cause; see troubleshooting in §3. |
| 🟢 Low | **Resend domain verification** | For deliverability beyond `onboarding@resend.dev`. |
| 🟢 Low | **Real Terms/Privacy pages** | Consent checkbox links currently `#`. |
| 🟢 Low | **Persist funnel progress** | In-memory state resets on refresh. |
| 🟢 Low | **Stripe fulfilment webhook** | Auto-provision/notify on successful payment. |
| 🟢 Low | **Remove legacy server fns** | `generateFreeArticle`, `sendArticleEmail`, `attachArticleToLead` unused. |

---

## 11. Local dev & deploy

```bash
npm install
npm run build          # builds .vercel/output (Vercel preset)
npx vite preview       # local preview of the build
```

**Deploy:** push to `main` on GitHub → Vercel auto-deploys. For env-var changes,
redeploy (Deployments → ⋯ → Redeploy, uncheck build cache). Confirm deploys go
green "Ready" (~20–35s); a 2s "Error" means a config/build failure — read the
build log.

---

## 12. Changelog

- **2026-06-03** — Article capped at ~1,200 words (4 sections, 5 FAQs). Added
  website-based **location detection** (pre-fills city). **Real competitor data**
  via SerpApi in Step 4 (with seeded fallback). **Clickable top navigation** +
  step indicator. **Stripe Checkout** wired to the 3 package buttons (needs env
  vars + products). Documented WordPress publish troubleshooting (awaiting live
  error to confirm fix).
- **2026-06-02** — Article upgraded: hero + mid images (LoremFlickr), opening hook,
  clickable TOC, 8 FAQs, author/E-E-A-T block, contextual links, JSON-LD schema
  (Article + FAQPage). Created this project document.
- **2026-06-02** — Fixed Vercel build failures (`vercel.json` functions glob).
- **2026-05-30** — Rebuilt article generation as chunked live-streaming (markdown)
  to fix Hobby-plan timeouts.
- **2026-05-30** — Added scroll-triggered packages modal; set package pricing.
- **2026-05-29** — Added packages section; changed "Claude.ai" → "Vector AI";
  changed result heading.
- **2026-05-29** — Added lead article storage, email-to-team, `/admin/leads`.
- **2026-05-29** — Real Acadium/Trustpilot social proof replacing placeholders.
- **2026-05-29** — Wired Resend email; migrated build Cloudflare → Vercel; switched
  lead capture to anon client; fixed several funnel bugs; initial QA pass.
