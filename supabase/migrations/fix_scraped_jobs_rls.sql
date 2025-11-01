-- Fix RLS policy for scraped_jobs to allow inserts

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own scraped jobs" ON scraped_jobs;
DROP POLICY IF EXISTS "Users can update their own scraped jobs" ON scraped_jobs;
DROP POLICY IF EXISTS "Users can delete their own scraped jobs" ON scraped_jobs;

-- Create new policies that include INSERT
CREATE POLICY "Users can view their own scraped jobs"
  ON scraped_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraped jobs"
  ON scraped_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraped jobs"
  ON scraped_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraped jobs"
  ON scraped_jobs FOR DELETE
  USING (auth.uid() = user_id);
