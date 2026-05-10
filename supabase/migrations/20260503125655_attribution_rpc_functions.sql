
-- RPC: requests grouped by bot_family
CREATE OR REPLACE FUNCTION attribution_by_bot_family()
RETURNS TABLE(bot_family text, count bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT bot_family, COUNT(*) AS count
  FROM request_events
  WHERE bot_family IS NOT NULL
  GROUP BY bot_family
  ORDER BY count DESC;
$$;

-- RPC: requests grouped by route_type
CREATE OR REPLACE FUNCTION attribution_by_route()
RETURNS TABLE(route_type text, count bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT route_type, COUNT(*) AS count
  FROM request_events
  WHERE route_type IS NOT NULL
  GROUP BY route_type
  ORDER BY count DESC;
$$;

-- RPC: requests grouped by slug (top 20)
CREATE OR REPLACE FUNCTION attribution_by_slug()
RETURNS TABLE(slug text, count bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT slug, COUNT(*) AS count
  FROM request_events
  WHERE slug IS NOT NULL
  GROUP BY slug
  ORDER BY count DESC
  LIMIT 20;
$$;
;
