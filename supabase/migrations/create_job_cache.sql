-- Job Cache Table for JSearch API results
-- Reduces API calls by caching search results

CREATE TABLE IF NOT EXISTS job_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Cache key (unique identifier for this search)
  cache_key TEXT NOT NULL UNIQUE,
  
  -- Search parameters (for debugging/analytics)
  search_params JSONB NOT NULL,
  
  -- Cached job data
  jobs_data JSONB NOT NULL,
  job_count INTEGER NOT NULL DEFAULT 0,
  
  -- Cache metadata
  source TEXT NOT NULL DEFAULT 'jsearch', -- 'jsearch', 'indeed', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  
  -- Indexes
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for fast lookups
CREATE INDEX idx_job_cache_key ON job_cache(cache_key);
CREATE INDEX idx_job_cache_expires ON job_cache(expires_at);
CREATE INDEX idx_job_cache_source ON job_cache(source);
CREATE INDEX idx_job_cache_created ON job_cache(created_at DESC);

-- Auto-delete expired cache entries (runs daily)
CREATE OR REPLACE FUNCTION delete_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM job_cache
  WHERE expires_at < NOW();
  
  RAISE NOTICE 'Deleted expired cache entries';
END;
$$ LANGUAGE plpgsql;

-- Popular searches tracking (for pre-fetching)
CREATE TABLE IF NOT EXISTS popular_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Search info
  keywords TEXT[] NOT NULL,
  location TEXT,
  search_count INTEGER DEFAULT 1,
  
  -- Metadata
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint on search combination
  CONSTRAINT unique_search UNIQUE (keywords, location)
);

CREATE INDEX idx_popular_searches_count ON popular_searches(search_count DESC);
CREATE INDEX idx_popular_searches_recent ON popular_searches(last_searched_at DESC);

-- Function to track popular searches
CREATE OR REPLACE FUNCTION track_search(
  p_keywords TEXT[],
  p_location TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO popular_searches (keywords, location, search_count, last_searched_at)
  VALUES (p_keywords, p_location, 1, NOW())
  ON CONFLICT (keywords, location)
  DO UPDATE SET
    search_count = popular_searches.search_count + 1,
    last_searched_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Cache statistics view
CREATE OR REPLACE VIEW cache_stats AS
SELECT
  source,
  COUNT(*) as total_entries,
  SUM(job_count) as total_jobs_cached,
  SUM(access_count) as total_accesses,
  AVG(access_count) as avg_accesses_per_entry,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_entries,
  COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_entries
FROM job_cache
GROUP BY source;

COMMENT ON TABLE job_cache IS 'Caches job search results to reduce API calls';
COMMENT ON TABLE popular_searches IS 'Tracks popular search combinations for pre-fetching';
COMMENT ON VIEW cache_stats IS 'Cache performance statistics';
