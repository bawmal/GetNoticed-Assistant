-- Allow users to view cached jobs from the enhanced scraping system
-- These jobs have user_id = 'CACHED' and should be visible to all authenticated users

CREATE POLICY "Users can view cached jobs from enhanced scraping"
  ON scraped_jobs FOR SELECT
  USING (user_id = 'CACHED' AND auth.uid() IS NOT NULL);

-- Also allow the system to insert cached jobs
CREATE POLICY "System can insert cached jobs"
  ON scraped_jobs FOR INSERT
  WITH CHECK (user_id = 'CACHED');
