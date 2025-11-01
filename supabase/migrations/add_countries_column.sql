-- Add countries column to job_scraping_preferences table
ALTER TABLE job_scraping_preferences 
ADD COLUMN IF NOT EXISTS countries TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN job_scraping_preferences.countries IS 'Preferred countries for job search (e.g., United States, Canada, Remote/Worldwide)';
