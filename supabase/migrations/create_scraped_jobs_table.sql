-- Create scraped_jobs table for proactive job discovery
CREATE TABLE IF NOT EXISTS scraped_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job source information
  source TEXT NOT NULL, -- 'linkedin', 'indeed', 'company_direct'
  external_id TEXT NOT NULL, -- Job ID from source
  
  -- Job details
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  url TEXT NOT NULL,
  posted_date TIMESTAMP,
  salary_range TEXT,
  employment_type TEXT,
  seniority_level TEXT,
  departments TEXT[],
  
  -- AI-powered fit analysis
  fit_score INTEGER, -- 0-100 match score
  fit_analysis JSONB, -- Full analysis from Gemini
  
  -- LinkedIn connection data
  connections JSONB, -- { first_degree: 2, second_degree: 5, employees: [...] }
  has_connections BOOLEAN DEFAULT FALSE,
  connection_flag JSONB, -- { level: 1, color: 'green', label: '1st Degree', icon: '🟢' }
  
  -- Metadata
  scraped_at TIMESTAMP DEFAULT NOW(),
  is_new BOOLEAN DEFAULT TRUE, -- User hasn't seen it yet
  is_saved BOOLEAN DEFAULT FALSE, -- User saved for later
  is_applied BOOLEAN DEFAULT FALSE, -- User applied
  is_dismissed BOOLEAN DEFAULT FALSE, -- User dismissed
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint: same job from same source for same user
  UNIQUE(external_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_scraped_jobs_user_id ON scraped_jobs(user_id);
CREATE INDEX idx_scraped_jobs_fit_score ON scraped_jobs(fit_score DESC);
CREATE INDEX idx_scraped_jobs_posted_date ON scraped_jobs(posted_date DESC);
CREATE INDEX idx_scraped_jobs_is_new ON scraped_jobs(is_new) WHERE is_new = TRUE;
CREATE INDEX idx_scraped_jobs_has_connections ON scraped_jobs(has_connections) WHERE has_connections = TRUE;
CREATE INDEX idx_scraped_jobs_connection_level ON scraped_jobs((connection_flag->>'level'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scraped_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER scraped_jobs_updated_at
  BEFORE UPDATE ON scraped_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_scraped_jobs_updated_at();

-- Enable Row Level Security
ALTER TABLE scraped_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scraped jobs"
  ON scraped_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraped jobs"
  ON scraped_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraped jobs"
  ON scraped_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Create user preferences table for job scraping
CREATE TABLE IF NOT EXISTS job_scraping_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Search preferences
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['Product Manager', 'Senior PM']
  locations TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['San Francisco', 'Remote']
  target_companies TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['Google', 'Meta']
  
  -- Filters
  min_salary INTEGER,
  employment_types TEXT[] DEFAULT ARRAY['Full-time']::TEXT[],
  seniority_levels TEXT[] DEFAULT ARRAY[]::TEXT[],
  remote_only BOOLEAN DEFAULT FALSE,
  
  -- Scraping schedule
  scrape_frequency TEXT DEFAULT '4hours', -- '1hour', '4hours', '12hours', '24hours'
  last_scraped_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Notifications
  notify_on_new_jobs BOOLEAN DEFAULT TRUE,
  notify_on_connections BOOLEAN DEFAULT TRUE,
  min_fit_score_for_notification INTEGER DEFAULT 70,
  
  -- LinkedIn integration
  linkedin_id TEXT,
  linkedin_access_token TEXT,
  linkedin_token_expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for preferences
ALTER TABLE job_scraping_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scraping preferences"
  ON job_scraping_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create comments for documentation
COMMENT ON TABLE scraped_jobs IS 'Stores jobs scraped from LinkedIn, Indeed, and company sites with AI fit scores and connection data';
COMMENT ON COLUMN scraped_jobs.connection_flag IS 'LinkedIn connection level indicator: 1st (green), 2nd (blue), 3rd (gray)';
COMMENT ON COLUMN scraped_jobs.fit_score IS 'AI-calculated match score (0-100) based on user profile';
COMMENT ON TABLE job_scraping_preferences IS 'User preferences for automated job scraping and notifications';
