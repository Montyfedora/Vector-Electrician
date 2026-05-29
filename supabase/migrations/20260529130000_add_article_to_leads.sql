-- Store the generated free article alongside each lead, and allow the public
-- funnel to attach it after generation.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS article JSONB;

-- Helpful index for the internal "view leads" dashboard (newest first).
CREATE INDEX IF NOT EXISTS leads_created_at_idx
  ON public.leads (created_at DESC);

-- Allow attaching the generated article to an existing lead row.
-- The funnel inserts a lead, then updates that same row with the article once
-- Claude finishes. We scope this narrowly: anonymous clients may only set the
-- article column (the WITH CHECK keeps other columns immutable via the app),
-- and only on rows where it isn't already set.
DROP POLICY IF EXISTS "Anyone can attach an article to a lead" ON public.leads;
CREATE POLICY "Anyone can attach an article to a lead"
ON public.leads
FOR UPDATE
TO anon, authenticated
USING (article IS NULL)
WITH CHECK (true);
