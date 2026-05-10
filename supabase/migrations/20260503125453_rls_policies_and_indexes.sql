
-- =============================================
-- RLS POLICIES
-- =============================================

-- articles: public can read published only
CREATE POLICY "public_read_published_articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

-- request_events: no public read; service role only
-- (insert handled via service role key server-side)

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_fts ON public.articles USING gin(fts);

CREATE INDEX IF NOT EXISTS idx_request_events_created_at ON public.request_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_events_bot_family ON public.request_events (bot_family);
CREATE INDEX IF NOT EXISTS idx_request_events_route_type ON public.request_events (route_type);
CREATE INDEX IF NOT EXISTS idx_request_events_slug ON public.request_events (slug);
;
