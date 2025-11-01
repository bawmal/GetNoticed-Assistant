-- SQL Functions for cache management

-- Increment cache access count
CREATE OR REPLACE FUNCTION increment_cache_access(p_cache_key TEXT)
RETURNS void AS $$
BEGIN
  UPDATE job_cache
  SET 
    access_count = access_count + 1,
    last_accessed_at = NOW()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql;

-- Get cache hit rate statistics
CREATE OR REPLACE FUNCTION get_cache_hit_rate(days INTEGER DEFAULT 7)
RETURNS TABLE(
  total_searches BIGINT,
  cache_hits BIGINT,
  cache_misses BIGINT,
  hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH search_stats AS (
    SELECT
      SUM(access_count) as hits,
      COUNT(*) as total_entries
    FROM job_cache
    WHERE created_at > NOW() - (days || ' days')::INTERVAL
  )
  SELECT
    (SELECT SUM(search_count) FROM popular_searches 
     WHERE last_searched_at > NOW() - (days || ' days')::INTERVAL) as total_searches,
    hits as cache_hits,
    (SELECT SUM(search_count) FROM popular_searches 
     WHERE last_searched_at > NOW() - (days || ' days')::INTERVAL) - hits as cache_misses,
    ROUND((hits::NUMERIC / NULLIF((SELECT SUM(search_count) FROM popular_searches 
     WHERE last_searched_at > NOW() - (days || ' days')::INTERVAL), 0)) * 100, 2) as hit_rate
  FROM search_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_cache_access IS 'Increments access count for cache analytics';
COMMENT ON FUNCTION get_cache_hit_rate IS 'Calculates cache hit rate over specified days';
