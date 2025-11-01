-- EMERGENCY FIX: Temporarily disable RLS to see jobs
-- Run this in Supabase SQL Editor

-- 1. Disable RLS temporarily
ALTER TABLE scraped_jobs DISABLE ROW LEVEL SECURITY;

-- 2. Check what's actually in the table
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE is_cached IS NOT NULL) as has_is_cached_column,
  COUNT(*) FILTER (WHERE is_cached = true) as cached_jobs,
  MIN(scraped_at) as oldest_job,
  MAX(scraped_at) as newest_job
FROM scraped_jobs;

-- 3. Show sample jobs
SELECT 
  id, 
  user_id, 
  is_cached, 
  source, 
  title, 
  company, 
  scraped_at,
  CASE 
    WHEN user_id IS NULL THEN 'NULL'
    WHEN user_id = 'CACHED' THEN 'CACHED_STRING'
    ELSE 'USER_UUID'
  END as user_id_type
FROM scraped_jobs 
ORDER BY scraped_at DESC 
LIMIT 10;

-- 4. Add is_cached column if it doesn't exist
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT FALSE;

-- 5. Update all recent jobs to be cached
UPDATE scraped_jobs 
SET is_cached = true 
WHERE scraped_at >= NOW() - INTERVAL '7 days';

-- 6. Check result after update
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE is_cached = true) as cached_jobs
FROM scraped_jobs;
