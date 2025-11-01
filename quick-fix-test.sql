-- QUICK TEST: Temporarily disable RLS to see if jobs display
-- Run this in Supabase SQL Editor to test

-- 1. Disable RLS temporarily
ALTER TABLE scraped_jobs DISABLE ROW LEVEL SECURITY;

-- 2. Check if is_cached column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scraped_jobs' 
AND column_name = 'is_cached';

-- 3. Check what jobs exist
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE is_cached = true) as cached_jobs,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as user_jobs
FROM scraped_jobs;

-- 4. Show sample jobs
SELECT id, user_id, is_cached, source, title, company, scraped_at
FROM scraped_jobs 
ORDER BY scraped_at DESC 
LIMIT 5;

-- REMEMBER: Re-enable RLS after testing
-- ALTER TABLE scraped_jobs ENABLE ROW LEVEL SECURITY;
