-- Add countries column to job_scraping_preferences table
-- Run this in Supabase SQL Editor

ALTER TABLE job_scraping_preferences 
ADD COLUMN IF NOT EXISTS countries TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_scraping_preferences' 
AND column_name = 'countries';
