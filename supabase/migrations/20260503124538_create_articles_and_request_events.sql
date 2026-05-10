
-- Articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  headline         text NOT NULL,
  summary          text NOT NULL DEFAULT '',
  full_body        text NOT NULL DEFAULT '',
  category         text NOT NULL DEFAULT '',
  tags             text[] NOT NULL DEFAULT '{}',
  claim            text NOT NULL DEFAULT '',
  evidence_source  text NOT NULL DEFAULT '',
  author_name      text NOT NULL DEFAULT '',
  author_email     text NOT NULL DEFAULT '',
  company          text NOT NULL DEFAULT '',
  role             text NOT NULL DEFAULT '',
  cta_label        text NOT NULL DEFAULT '',
  cta_url          text NOT NULL DEFAULT '',
  canonical_url    text NOT NULL DEFAULT '',
  published_at     timestamptz,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived'))
);

-- Request events table (no raw IPs ever stored)
CREATE TABLE IF NOT EXISTS public.request_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  route_type   text NOT NULL,
  path         text NOT NULL,
  slug         text,
  category     text,
  user_agent   text,
  bot_family   text,
  referrer     text,
  query_params jsonb,
  ip_hash      text,
  status_code  integer
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS articles_status_published_at ON public.articles (status, published_at DESC);
CREATE INDEX IF NOT EXISTS articles_category ON public.articles (category) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS articles_slug ON public.articles (slug);
CREATE INDEX IF NOT EXISTS request_events_created_at ON public.request_events (created_at DESC);
CREATE INDEX IF NOT EXISTS request_events_bot_family ON public.request_events (bot_family);
CREATE INDEX IF NOT EXISTS request_events_route_type ON public.request_events (route_type);
CREATE INDEX IF NOT EXISTS request_events_slug ON public.request_events (slug);

-- Full-text search index on articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(headline,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(full_body,''))
  ) STORED;
CREATE INDEX IF NOT EXISTS articles_fts ON public.articles USING GIN (fts);

-- RLS: public reads on published articles only
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON public.articles
  FOR SELECT USING (status = 'published');

-- Service role bypasses RLS for admin writes
ALTER TABLE public.request_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.request_events
  USING (false); -- only service role (bypasses RLS) can touch this
;
