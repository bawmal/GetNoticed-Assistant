-- Complete Schema Fix - Add ALL missing columns
-- Run this in Supabase SQL Editor

-- Add all potentially missing columns
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT FALSE;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS remote BOOLEAN DEFAULT FALSE;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS job_type TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS requirements TEXT[];
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT[];
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS qualifications TEXT[];
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS apply_url TEXT;

-- Make user_id nullable
ALTER TABLE scraped_jobs ALTER COLUMN user_id DROP NOT NULL;

-- Disable RLS
ALTER TABLE scraped_jobs DISABLE ROW LEVEL SECURITY;

-- Drop old constraints
ALTER TABLE scraped_jobs DROP CONSTRAINT IF EXISTS scraped_jobs_external_id_user_id_key;
ALTER TABLE scraped_jobs DROP CONSTRAINT IF EXISTS check_user_or_cached;

-- Create new unique constraint
DROP INDEX IF EXISTS scraped_jobs_cached_external_id_unique;
CREATE UNIQUE INDEX scraped_jobs_cached_external_id_unique 
  ON scraped_jobs (external_id) 
  WHERE is_cached = TRUE;

-- IMPORTANT: Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify all columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'scraped_jobs' 
ORDER BY ordinal_position;
