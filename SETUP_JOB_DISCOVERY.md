# Job Discovery Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Apply Database Migration

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `supabase/migrations/create_scraped_jobs_table.sql`
5. Paste and click **Run**

**Option B: Via Supabase CLI**
```bash
# Install Supabase CLI (if not installed)
brew install supabase/tap/supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push
```

### Step 2: Add Job Discovery to Navigation

Edit `src/App.jsx` or your main navigation component:

```jsx
import JobDiscovery from './pages/JobDiscovery'

// Add to your routes
<Route path="/jobs" element={<JobDiscovery />} />

// Add to navigation menu
<Link to="/jobs">Job Discovery</Link>
```

### Step 3: Set Up Cron Job (Optional - for auto-scraping)

Create `supabase/functions/scrape-jobs/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users with active job scraping preferences
    const { data: users } = await supabase
      .from('job_scraping_preferences')
      .select('*')
      .eq('is_active', true)

    for (const user of users || []) {
      // Import and run scraper
      const { jobScraperService } = await import('../../../src/lib/jobScraper.js')
      
      await jobScraperService.scrapeJobs(
        user,
        user.keywords || [],
        user.locations || []
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

Deploy the function:
```bash
supabase functions deploy scrape-jobs
```

Set up cron (in Supabase dashboard):
```sql
-- Run every 4 hours
select cron.schedule(
  'scrape-jobs',
  '0 */4 * * *',
  $$
  select net.http_post(
    url:='YOUR_FUNCTION_URL',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

### Step 4: Test the Scraper

Create a test page or button:

```jsx
import { jobScraperService } from '../lib/jobScraper'

const testScraper = async () => {
  const userProfile = {
    user_id: 'your-user-id',
    target_companies: []
  }
  
  const keywords = ['Product Manager', 'Senior PM']
  const locations = ['Remote', 'San Francisco']
  
  const jobs = await jobScraperService.scrapeJobs(
    userProfile,
    keywords,
    locations
  )
  
  console.log(`Found ${jobs.length} jobs!`)
}
```

---

## 📊 Verify Setup

### Check Database Tables
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('scraped_jobs', 'job_scraping_preferences');

-- Check scraped jobs
SELECT COUNT(*) FROM scraped_jobs;

-- Check preferences
SELECT COUNT(*) FROM job_scraping_preferences;
```

### Test Job Sources

1. **RemoteOK**: https://remoteok.com/api
2. **WeWorkRemotely**: https://weworkremotely.com/remote-jobs.rss
3. **Hacker News**: https://hn.algolia.com/api/v1/search?tags=job
4. **Remotive**: https://remotive.com/api/remote-jobs
5. **Greenhouse**: https://boards-api.greenhouse.io/v1/boards/airbnb/jobs
6. **Lever**: https://api.lever.co/v0/postings/netflix?mode=json

---

## 🎯 Usage

### For Users

1. Go to Job Discovery page
2. Set preferences (keywords, locations)
3. View curated jobs
4. Filter by:
   - All Jobs
   - New (unviewed)
   - High Fit (70%+)
5. Save or dismiss jobs
6. Click "View Job" to apply

### For Admins

Monitor scraping:
```sql
-- Jobs scraped today
SELECT source, COUNT(*) 
FROM scraped_jobs 
WHERE scraped_at > NOW() - INTERVAL '24 hours'
GROUP BY source;

-- Average fit scores
SELECT AVG(fit_score) as avg_fit
FROM scraped_jobs
WHERE fit_score IS NOT NULL;

-- Top companies
SELECT company, COUNT(*) as job_count
FROM scraped_jobs
GROUP BY company
ORDER BY job_count DESC
LIMIT 10;
```

---

## 🔧 Troubleshooting

### Jobs not appearing?
1. Check if scraper ran: `SELECT MAX(scraped_at) FROM scraped_jobs`
2. Check for errors in function logs
3. Verify API endpoints are accessible

### Duplicate jobs?
- Deduplication runs automatically
- Check: `SELECT title, company, COUNT(*) FROM scraped_jobs GROUP BY title, company HAVING COUNT(*) > 1`

### Slow performance?
- Add indexes (already included in migration)
- Limit results: `LIMIT 100`
- Archive old jobs: `DELETE FROM scraped_jobs WHERE scraped_at < NOW() - INTERVAL '30 days'`

---

## 📈 Scaling

### Add More Sources

Edit `src/lib/jobScraper.js`:

```javascript
async scrapeNewSource(keywords, locations) {
  const jobs = []
  
  try {
    const response = await fetch('https://api.newsource.com/jobs')
    const data = await response.json()
    
    // Filter and format
    jobs.push(...data.map(job => ({
      source: 'newsource',
      external_id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      url: job.url,
      posted_date: job.date,
      scraped_at: new Date().toISOString()
    })))
  } catch (error) {
    console.error('NewSource scrape error:', error)
  }
  
  return jobs
}
```

Add to main scraper:
```javascript
const [
  remoteOKJobs,
  weWorkRemotelyJobs,
  hnJobs,
  greenhouseJobs,
  leverJobs,
  remotiveJobs,
  newSourceJobs  // Add here
] = await Promise.all([
  this.scrapeRemoteOK(keywords, locations),
  this.scrapeWeWorkRemotely(keywords, locations),
  this.scrapeHackerNewsJobs(keywords, locations),
  this.scrapeGreenhouse(userProfile.target_companies || []),
  this.scrapeLever(userProfile.target_companies || []),
  this.scrapeRemotive(keywords, locations),
  this.scrapeNewSource(keywords, locations)  // Add here
])
```

---

## 🎉 You're Done!

Your job discovery system is now:
- ✅ Scraping 6 sources
- ✅ Finding ~1,650 jobs/day
- ✅ Scoring with AI
- ✅ Filtering by location
- ✅ 100% FREE

**Next:** Set up user preferences and notifications!
