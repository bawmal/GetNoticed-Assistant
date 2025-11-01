-- Add missing columns to scraped_jobs table
-- Run this in Supabase SQL Editor

-- Add is_cached column
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT FALSE;

-- Add category column (this was missing!)
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS category TEXT;

-- Add any other potentially missing columns
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS remote BOOLEAN DEFAULT FALSE;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS job_type TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Make user_id nullable for cached jobs
ALTER TABLE scraped_jobs ALTER COLUMN user_id DROP NOT NULL;

-- Disable RLS temporarily
ALTER TABLE scraped_jobs DISABLE ROW LEVEL SECURITY;

-- Drop old constraints
ALTER TABLE scraped_jobs DROP CONSTRAINT IF EXISTS scraped_jobs_external_id_user_id_key;

-- Create new unique constraint for cached jobs
CREATE UNIQUE INDEX IF NOT EXISTS scraped_jobs_cached_external_id_unique 
  ON scraped_jobs (external_id) 
  WHERE is_cached = TRUE;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scraped_jobs' 
ORDER BY ordinal_position;
