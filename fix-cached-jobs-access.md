# Fix Cached Jobs Access Issue

## Problem
The enhanced scraping system found 1,551 jobs but they're not displaying because of Row Level Security (RLS) policies.

## Solution
Run this SQL in your Supabase dashboard to allow users to see cached jobs:

### 1. Go to Supabase Dashboard
- Open your project
- Go to SQL Editor
- Run the following SQL:

```sql
-- Allow users to view cached jobs from the enhanced scraping system
CREATE POLICY "Users can view cached jobs from enhanced scraping"
  ON scraped_jobs FOR SELECT
  USING (user_id = 'CACHED' AND auth.uid() IS NOT NULL);

-- Also allow the system to insert cached jobs  
CREATE POLICY "System can insert cached jobs"
  ON scraped_jobs FOR INSERT
  WITH CHECK (user_id = 'CACHED');
```

### 2. Alternative: Temporary Fix (if SQL doesn't work)
If the SQL policies don't work immediately, you can temporarily disable RLS:

```sql
-- TEMPORARY: Disable RLS to test (re-enable after testing)
ALTER TABLE scraped_jobs DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable RLS after testing:**
```sql
ALTER TABLE scraped_jobs ENABLE ROW LEVEL SECURITY;
```

### 3. Check the Browser Console
After running the SQL, refresh your app and check the browser console for these debug messages:

```
🔍 Loading jobs with filter: all
📊 Raw query result: { cachedJobsCount: 1551, error: null, sampleJob: {...} }
📊 Final jobs to show: 1551 (filter: all)
📋 Job sources: ['ats_boards', 'remoteok', 'ats_wd1', ...]
```

### 4. Expected Result
After fixing the RLS policies, you should see:
- **All Jobs (1551)** instead of empty list
- Jobs from multiple sources in the job list
- Proper filtering working

## Why This Happened
- Enhanced scraping saves jobs with `user_id = 'CACHED'` 
- RLS policies only allowed users to see jobs with their own `user_id`
- Cached jobs were blocked by security policies
- New policies allow authenticated users to see cached jobs
