# Vector.SEO — Electrician Funnel

A TanStack Start (React 19 + SSR) funnel that captures local-contractor leads,
generates a custom SEO article with Claude, emails it via Resend, and offers
1-click WordPress publishing. Backed by Supabase.

The primary funnel lives at **`/electricians-2`**.

---

## Deploying to Vercel

This project builds with **Nitro's `vercel` preset**, which emits a native
Vercel Build Output API bundle (`.vercel/output`). No adapter glue required.

### 1. Push the repo to GitHub/GitLab and import it in Vercel

When importing, Vercel reads `vercel.json`, which already sets:

- **Build command:** `npm run build`
- **Output directory:** `.vercel/output`
- **Framework preset:** `Other` (`framework: null`)
- **Build env:** `NITRO_PRESET=vercel`

You should not need to change any of these in the dashboard.

### 2. Add Environment Variables

In **Vercel → Project → Settings → Environment Variables**, add the keys from
[`.env.example`](./.env.example). At minimum, for the funnel to work end-to-end:

| Variable | Needed for | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Lead capture | |
| `SUPABASE_PUBLISHABLE_KEY` | Lead capture | anon key |
| `VITE_SUPABASE_URL` | Client bundle | must exist at **build** time |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client bundle | must exist at **build** time |
| `ANTHROPIC_API_KEY` | Article generation | |
| `RESEND_API_KEY` | Email delivery | optional; funnel still works without it |
| `LEAD_FROM_EMAIL` | Email delivery | verified Resend sender |
| `LEAD_NOTIFY_EMAIL` | Lead alerts to you | defaults to `monty@acadium.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Admin dashboard only** | needed to read all leads at `/admin/leads` |
| `ADMIN_TOKEN` | **Admin dashboard only** | access code you type at `/admin/leads` |

> The four `VITE_*` and non-`VITE_` Supabase values are intentionally duplicated:
> the `VITE_` pair is inlined into the browser bundle at build time, the other
> pair is read by server functions at runtime. Set all four.

> **Service-role key is NOT required.** Lead capture uses the anon key plus the
> `"Anyone can submit a lead"` RLS policy, so the funnel does not depend on
> `SUPABASE_SERVICE_ROLE_KEY` being present on Vercel.

### 3. Deploy

Trigger a deploy. Vercel runs `npm run build`, finds `.vercel/output`, and ships
the SSR function (Node 22, response streaming) plus static assets.

### Local production preview

```bash
npm install
npm run build          # builds .vercel/output (NITRO_PRESET defaults to vercel)
npx vite preview       # serves the built app locally
```

### Building for a different host

```bash
NITRO_PRESET=cloudflare-module npm run build   # Cloudflare Workers (-> dist/)
NITRO_PRESET=node-server       npm run build   # generic Node server
```

---

## Database

One table, `leads`, created by `supabase/migrations/`. Columns: `name`, `email`,
`target`, `snapshot` (full funnel answers as JSON), `article` (the generated SEO
article as JSON), `created_at`. Row Level Security is on:

- anonymous **insert** is allowed (this is what lets the public funnel save leads
  with only the anon key),
- anonymous **update** is allowed only to attach the article to a just-created row.

Apply migrations with the Supabase CLI:

```bash
supabase db push
```

> Run the new migration `20260529130000_add_article_to_leads.sql` before deploying
> — it adds the `article` column the funnel now writes to.

## Viewing your leads

Two ways:

1. **Supabase dashboard** → Table Editor → `leads` (always available, no setup).
2. **Built-in admin page at `/admin/leads`** — a cleaner view that lists every
   lead and lets you expand each one to read its generated article. It's gated by
   `ADMIN_TOKEN` (you type the code once) and reads all rows via the service-role
   key, so set **both** `ADMIN_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` for it to
   work. The page is `noindex`.

## Lead notifications

Every completed lead also triggers an email (via Resend) to `LEAD_NOTIFY_EMAIL`
(defaults to `monty@acadium.com`) containing the full lead details, survey
answers, and the complete generated article — with reply-to set to the lead so
you can respond directly. The lead separately receives their article by email.

---

## How the funnel works

1. **Hero** — visitor enters their website URL.
2. **Scan** — animated audit (visual; the deep live scan lives on `/electricians`).
3. **Business info** — brand, city, services offered / not offered, top priority.
4. **Process** — explains the offer.
5. **Competitors** — seeded competitive snapshot (illustrative).
6. **Account** — name + email + consent → saves the lead, generates the article
   with Claude, emails it via Resend, and offers WordPress publish / HTML export.

---

## Notes & gotchas

- `wrangler.jsonc` is leftover Cloudflare config and is unused on Vercel. Safe to
  keep or delete.
- The competitor numbers and the scan animation on `/electricians-2` are
  illustrative, not live data. The live multi-engine scan (SerpApi + Perplexity)
  is on the `/electricians` route and needs `SERPAPI_KEY` + `PERPLEXITY_API_KEY`.
- Funnel progress is held in memory; a page refresh restarts the funnel. See the
  QA report for the optional "persist progress" enhancement.
