# Google Custom Search API Setup Guide

## 🔧 Complete Setup Process

### 1. Google Cloud Console Setup

#### Step 1: Create Project
```bash
1. Go to: https://console.cloud.google.com
2. Click "New Project" 
3. Name: "Job Scraper API"
4. Click "Create"
```

#### Step 2: Enable Custom Search API
```bash
1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Custom Search API"
3. Click on it and press "Enable"
4. Wait for activation (1-2 minutes)
```

#### Step 3: Create API Key
```bash
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (keep it secure!)
4. Optional: Restrict the key to "Custom Search API" only
```

#### Step 4: Set Up Billing (Required)
```bash
1. Go to "Billing" in Google Cloud Console
2. Link a payment method (credit card required)
3. Note: You won't be charged for the free tier (100 searches/day)
4. Set up billing alerts to avoid unexpected charges
```

---

### 2. Custom Search Engine Setup

#### Step 1: Create Search Engine
```bash
1. Go to: https://programmablesearchengine.google.com
2. Click "Add" to create new search engine
3. Sites to search: Select "Search the entire web"
4. Name: "Job Search Engine"
5. Click "Create"
```

#### Step 2: Get Search Engine ID
```bash
1. In your search engine dashboard
2. Click "Setup" tab
3. Copy the "Search engine ID" (starts with letters/numbers)
4. This is your CX parameter
```

#### Step 3: Configure Search Settings
```bash
1. Go to "Setup" > "Advanced"
2. Enable "Search the entire web" 
3. Enable "Image search" (optional)
4. Set "SafeSearch" to Off (for broader results)
```

---

### 3. Environment Variables Setup

Add these to your `.env` file:

```bash
# Google Custom Search API Configuration
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Example:
# GOOGLE_CUSTOM_SEARCH_API_KEY=your_google_api_key_here
# GOOGLE_SEARCH_ENGINE_ID=c1234567890abcdef
```

---

### 4. Test Your Setup

#### Quick Test Script:
```javascript
// Test file: test-google-search.js
const GOOGLE_API_KEY = 'your_api_key'
const SEARCH_ENGINE_ID = 'your_cx_id'

async function testGoogleSearch() {
  const query = 'JP Morgan Chase jobs Product Manager'
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.error) {
      console.error('❌ Error:', data.error.message)
    } else {
      console.log('✅ Success! Found', data.searchInformation.totalResults, 'results')
      console.log('First result:', data.items[0].title)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

testGoogleSearch()
```

---

## 💰 Cost Analysis

### Free Tier Limits:
- **100 searches per day** - FREE
- **10 results per search** - Maximum
- **1 query per second** - Rate limit

### Paid Tier:
- **$5 per 1,000 additional queries**
- **Up to 10,000 queries per day** - Maximum

### Realistic Usage:
```bash
# Typical job scraping usage:
- 10 target companies
- 2 searches per company (different keywords)
- 20 searches per day total
- Well within free tier!

# Monthly cost: $0
# Only pay if you exceed 100 searches/day
```

---

## 🔍 Search Query Examples

The system will automatically generate these types of queries:

### Company-Specific Searches:
```bash
"JP Morgan Chase" "Product Manager" jobs site:*.com
"Goldman Sachs" "Data Scientist" site:linkedin.com/jobs
"Microsoft" "Software Engineer" jobs careers
```

### Job Board Searches:
```bash
"Apple" "UX Designer" site:linkedin.com/jobs
"Netflix" "Marketing Manager" site:indeed.com
"Stripe" "DevOps Engineer" jobs
```

### Location-Specific:
```bash
"Amazon" "Product Manager" jobs Toronto
"Google" "Software Engineer" jobs "New York"
```

---

## 🚀 Expected Results

### What You'll Get:
- **Real job postings** from company websites
- **LinkedIn job listings** 
- **Indeed/Glassdoor postings**
- **Direct career page links**
- **Salary information** (when available)
- **Location details**
- **Job descriptions**

### Example Output:
```bash
🔍 Google Custom Search for: "JP Morgan Chase jobs Product Manager"
🔍 Executing search: "JP Morgan Chase" "Product Manager" jobs site:*.com
✅ Parsed job: Vice President, Product Manager - Digital Channels at JP Morgan Chase
✅ Google Search found 3 jobs for JP Morgan Chase
⭐ Prioritized: "Vice President, Product Manager - Digital Channels" at JP Morgan Chase
```

---

## 🛡️ Security Best Practices

### API Key Security:
```bash
1. Never commit API keys to version control
2. Use environment variables only
3. Restrict API key to specific APIs
4. Set up usage quotas and alerts
5. Rotate keys periodically
```

### Rate Limiting:
```bash
1. Max 1 query per second (built into our code)
2. Max 100 queries per day (free tier)
3. Implement exponential backoff on errors
4. Cache results to avoid duplicate queries
```

---

## 🔧 Troubleshooting

### Common Issues:

#### "API Key not valid"
```bash
Solution: 
1. Check API key is correct
2. Ensure Custom Search API is enabled
3. Wait 5-10 minutes after enabling API
```

#### "Billing account required"
```bash
Solution:
1. Set up billing in Google Cloud Console
2. Add valid payment method
3. You won't be charged for free tier usage
```

#### "Search engine not found"
```bash
Solution:
1. Check Search Engine ID (CX parameter)
2. Ensure search engine is set to "Search entire web"
3. Wait a few minutes after creating search engine
```

#### "Quota exceeded"
```bash
Solution:
1. You've used 100+ searches today
2. Wait until tomorrow for reset
3. Or upgrade to paid tier
```

---

## 📊 Implementation Status

- ✅ **Complete API integration code** - Ready to use
- ✅ **Query building logic** - Smart search strategies  
- ✅ **Result parsing** - Extracts job details
- ✅ **Rate limiting** - Respects API limits
- ✅ **Error handling** - Graceful failures
- ✅ **Fallback system** - Works even if API fails

**Just add your API credentials and it's ready to go!** 🚀
