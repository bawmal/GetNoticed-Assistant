-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Job Cache Table
CREATE TABLE IF NOT EXISTS job_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL UNIQUE,
  search_params JSONB NOT NULL,
  jobs_data JSONB NOT NULL,
  job_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'jsearch',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_job_cache_key ON job_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_job_cache_expires ON job_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_job_cache_source ON job_cache(source);

-- Popular Searches Table
CREATE TABLE IF NOT EXISTS popular_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keywords TEXT[] NOT NULL,
  location TEXT,
  search_count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_search UNIQUE (keywords, location)
);

CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches(search_count DESC);

-- Function to track searches
CREATE OR REPLACE FUNCTION track_search(p_keywords TEXT[], p_location TEXT)
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

-- Function to increment cache access
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

-- Function to delete expired cache
CREATE OR REPLACE FUNCTION delete_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM job_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Cache stats view
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cache tables created successfully!';
  RAISE NOTICE '📊 Tables: job_cache, popular_searches';
  RAISE NOTICE '🔧 Functions: track_search, increment_cache_access, delete_expired_cache';
  RAISE NOTICE '📈 View: cache_stats';
END $$;
