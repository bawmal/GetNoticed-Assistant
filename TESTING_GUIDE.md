# 🧪 Testing Guide - Enhanced Job Scraping System

## 🚀 Quick Start Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file with:
```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional - Google Custom Search API (for enhanced scraping)
GOOGLE_CUSTOM_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

### 3. Run Quick Health Check
```bash
npm run test:quick
```

Expected output:
```
⚡ Quick System Health Check

🏥 Checking system health...
   Status: healthy
   Cached jobs available: true
   Last update: 2024-10-21T14:30:00.000Z

📊 Getting job statistics...
   Total cached jobs: 150
   Unique target companies: 5
   Jobs by source:
     - remoteok: 25 jobs
     - weworkremotely: 30 jobs
     - hackernews: 15 jobs

✅ Quick test completed!
🎉 System is working well!
```

---

## 🔬 Comprehensive Testing

### Run Full Test Suite
```bash
npm test
```

This tests:
- ✅ System health check
- ✅ Google API configuration
- ✅ Database connection
- ✅ Free sources scraping
- ✅ Target company research
- ✅ Multi-method search
- ✅ Job caching system
- ✅ User job retrieval
- ✅ Daily batch processing

Expected runtime: **3-5 minutes**

---

## 🛠️ Manual Testing

### Test Job Scraping

#### Quick Test (10-20 seconds)
```bash
npm run scrape:manual quick
```

#### Free Sources Only (30-60 seconds)
```bash
npm run scrape:manual free
```

#### Target Companies Only (1-2 minutes)
```bash
npm run scrape:manual companies
```

#### Full Daily Update (2-5 minutes)
```bash
npm run scrape:manual
```

### Test API Endpoints

#### Test Optimized Jobs API
```bash
curl -X GET "http://localhost:3000/api/jobs/optimized" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test System Health
```bash
curl -X GET "http://localhost:3000/api/jobs/optimized?action=health"
```

#### Test Job Statistics
```bash
curl -X GET "http://localhost:3000/api/jobs/optimized?action=stats"
```

---

## 🎯 Testing Specific Features

### 1. Test Multi-Method Search (LinkedIn Post Technique)

Create a test user with target companies:
```javascript
// In browser console or test script
const testCompanies = ['JP Morgan Chase', 'Goldman Sachs']

// This should search:
// - 8 ATS platforms per company
// - 2 company websites per company  
// - 3 job boards per company
// = 13 searches per company
```

Expected console output:
```
🎯 Multi-method search for JP Morgan Chase...
🏢 Searching 8 ATS platforms for JP Morgan Chase...
  ✅ boards.greenhouse.io: 3 jobs
  ✅ jobs.lever.co: 2 jobs
  ✅ wd1.myworkdayjobs.com: 5 jobs
✅ ATS platforms: 10 jobs for JP Morgan Chase
✅ Company website: 4 jobs for JP Morgan Chase  
✅ Job boards: 8 jobs for JP Morgan Chase
```

### 2. Test Job Caching System

```bash
# Populate cache
npm run scrape:manual free

# Check cache
npm run test:quick
```

Should show cached jobs available.

### 3. Test User Job Retrieval

```javascript
// Test in browser or Node.js
import { getJobsForUser } from './src/lib/optimizedJobService.js'

const jobs = await getJobsForUser('test-user-123')
console.log(`Found ${jobs.length} jobs in <100ms`)
```

### 4. Test Cron Job System

```bash
# Start cron jobs
npm run start:cron
```

Expected output:
```
🚀 Initializing scalable job scraping system...
🏥 Checking system health...
✅ System health: healthy
⏰ Starting scheduled job processing...
✅ Daily job scheduler started (runs at 2 AM daily)
✅ Job cache health check started (runs hourly)
✅ Weekly cleanup scheduler started (runs Sundays at 3 AM)
🎉 Job scraping system initialized successfully!
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Google API credentials not configured"
```bash
# Solution: Add Google API credentials to .env
GOOGLE_CUSTOM_SEARCH_API_KEY=your_key_here
GOOGLE_SEARCH_ENGINE_ID=your_cx_here
```

#### "Database connection failed"
```bash
# Solution: Check Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### "No cached jobs available"
```bash
# Solution: Run manual scrape to populate cache
npm run scrape:manual free
```

#### "Free sources scraping timeout"
```bash
# Solution: Check internet connection and try individual sources
# Some job boards may be temporarily unavailable
```

#### "Multi-method search failed"
```bash
# Solution: This usually means Google API issues
# Check API key, search engine ID, and billing setup
```

### Debug Mode

Enable detailed logging:
```bash
DEBUG=true npm test
```

### Check System Status

```javascript
// Get detailed system status
import { getSystemStatus } from './src/lib/startup.js'

const status = await getSystemStatus()
console.log(JSON.stringify(status, null, 2))
```

---

## 📊 Performance Benchmarks

### Expected Performance:

#### Response Times:
- **User job request**: <100ms (cached)
- **Quick scrape test**: 10-20 seconds
- **Free sources scrape**: 30-60 seconds
- **Company scrape**: 1-2 minutes
- **Full daily update**: 2-5 minutes

#### Job Counts (typical):
- **RemoteOK**: 20-50 jobs
- **WeWorkRemotely**: 15-40 jobs
- **HackerNews**: 10-30 jobs
- **Target companies**: 5-20 jobs per company
- **Total daily**: 100-500 jobs

#### API Usage:
- **Free tier**: 80-90 searches/day
- **Paid tier**: 200-500 searches/day
- **Cost**: $0-50/month

---

## ✅ Test Checklist

Before deploying to production:

### Basic Functionality:
- [ ] Quick health check passes
- [ ] Database connection works
- [ ] At least one free source returns jobs
- [ ] Job caching system works
- [ ] User job retrieval is fast (<100ms)

### Enhanced Features (Optional):
- [ ] Google API configured and working
- [ ] Multi-method search finds jobs
- [ ] Target company research works
- [ ] Daily batch processing completes

### Production Readiness:
- [ ] All tests pass
- [ ] Cron jobs start successfully
- [ ] API endpoints respond correctly
- [ ] Error handling works properly
- [ ] Performance meets benchmarks

---

## 🚀 Deployment Testing

### Test in Production Environment:

1. **Deploy to staging**
2. **Run full test suite**
3. **Monitor for 24 hours**
4. **Check daily batch processing**
5. **Verify user experience**
6. **Deploy to production**

### Monitoring Commands:

```bash
# Check system health
curl https://your-app.com/api/jobs/optimized?action=health

# Get job statistics  
curl https://your-app.com/api/jobs/optimized?action=stats

# Test user job retrieval
curl https://your-app.com/api/jobs/optimized \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## 🎉 Success Criteria

Your system is ready when:

✅ **All tests pass**  
✅ **Response times <100ms for users**  
✅ **Daily job updates run automatically**  
✅ **100+ jobs cached daily**  
✅ **Target company jobs appear**  
✅ **System handles 100+ concurrent users**  

**Congratulations! Your scalable job scraping system is production-ready!** 🚀
