-- Fix existing jobs to be marked as cached
-- Run this in Supabase SQL Editor

-- 1. First, add the is_cached column if it doesn't exist
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT FALSE;

-- 2. Update existing jobs to be marked as cached
-- (assuming they were inserted by the enhanced scraping system)
UPDATE scraped_jobs 
SET is_cached = true 
WHERE scraped_at >= NOW() - INTERVAL '24 hours'
AND (user_id IS NULL OR user_id = 'CACHED');

-- 3. Check the result
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE is_cached = true) as cached_jobs,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as user_jobs
FROM scraped_jobs;

-- 4. Show sample cached jobs
SELECT id, user_id, is_cached, source, title, company, scraped_at
FROM scraped_jobs 
WHERE is_cached = true
ORDER BY scraped_at DESC 
LIMIT 5;
