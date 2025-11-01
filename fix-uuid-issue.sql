-- Fix the UUID issue for cached jobs
-- Option 1: Add a separate column to identify cached jobs

-- Add a column to identify cached jobs
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT FALSE;

-- Create index for cached jobs
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_is_cached ON scraped_jobs(is_cached) WHERE is_cached = TRUE;

-- Update RLS policy to allow viewing cached jobs
DROP POLICY IF EXISTS "Users can view cached jobs from enhanced scraping" ON scraped_jobs;

CREATE POLICY "Users can view cached jobs"
  ON scraped_jobs FOR SELECT
  USING (is_cached = TRUE AND auth.uid() IS NOT NULL);

-- Allow system to insert cached jobs (use a system user UUID or make user_id nullable)
DROP POLICY IF EXISTS "System can insert cached jobs" ON scraped_jobs;

-- Make user_id nullable for cached jobs
ALTER TABLE scraped_jobs ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint: either user_id is provided OR is_cached is true
ALTER TABLE scraped_jobs ADD CONSTRAINT check_user_or_cached 
  CHECK (user_id IS NOT NULL OR is_cached = TRUE);

-- Policy for inserting cached jobs
CREATE POLICY "System can insert cached jobs"
  ON scraped_jobs FOR INSERT
  WITH CHECK (is_cached = TRUE AND user_id IS NULL);

-- Update the unique constraint to handle cached jobs
ALTER TABLE scraped_jobs DROP CONSTRAINT IF EXISTS scraped_jobs_external_id_user_id_key;

-- New unique constraint that handles cached jobs
CREATE UNIQUE INDEX scraped_jobs_external_id_unique 
  ON scraped_jobs (external_id) 
  WHERE is_cached = TRUE;

-- Keep unique constraint for user-specific jobs
CREATE UNIQUE INDEX scraped_jobs_user_external_id_unique 
  ON scraped_jobs (external_id, user_id) 
  WHERE user_id IS NOT NULL;
