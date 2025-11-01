# Quick Fix - Database is Empty

## Problem
The scraping found 1,551 jobs but **0 jobs are in the database**. This means the insert is failing silently.

## Solution

### Step 1: Make sure the database schema allows cached jobs

Run this SQL in Supabase:

```sql
-- 1. Add is_cached column
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT FALSE;

-- 2. Make user_id nullable (for cached jobs)
ALTER TABLE scraped_jobs ALTER COLUMN user_id DROP NOT NULL;

-- 3. Drop the old unique constraint that requires user_id
ALTER TABLE scraped_jobs DROP CONSTRAINT IF EXISTS scraped_jobs_external_id_user_id_key;

-- 4. Create new unique constraint for cached jobs
CREATE UNIQUE INDEX IF NOT EXISTS scraped_jobs_cached_external_id_unique 
  ON scraped_jobs (external_id) 
  WHERE is_cached = TRUE;

-- 5. Disable RLS temporarily
ALTER TABLE scraped_jobs DISABLE ROW LEVEL SECURITY;
```

### Step 2: Run scraping again

In your app, click **"Clear & Rescrape All Jobs"** button.

Watch the browser console for errors. You should see:
```
📝 Attempting to insert 1551 jobs...
Sample job to insert: {...}
✅ Successfully cached 1551 jobs for instant user access
```

If you see an error, it will now show the exact problem.

### Step 3: Check database again

Run this SQL:
```sql
SELECT COUNT(*) as total_jobs FROM scraped_jobs;
```

You should see 1,551 jobs!

## Common Errors and Fixes

### Error: "duplicate key value violates unique constraint"
**Fix:** The unique constraint is blocking inserts. Run:
```sql
DROP INDEX IF EXISTS scraped_jobs_external_id_user_id_key;
```

### Error: "null value in column user_id violates not-null constraint"
**Fix:** user_id must be nullable. Run:
```sql
ALTER TABLE scraped_jobs ALTER COLUMN user_id DROP NOT NULL;
```

### Error: "column is_cached does not exist"
**Fix:** Add the column. Run:
```sql
ALTER TABLE scraped_jobs ADD COLUMN is_cached BOOLEAN DEFAULT FALSE;
```

## After Fix

Once jobs are in the database:
1. Jobs should display in the "Simple Job List Test"
2. Main job list should show "All Jobs (1551)"
3. You can filter by source, location, etc.
