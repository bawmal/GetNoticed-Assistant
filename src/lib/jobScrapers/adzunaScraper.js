/**
 * Adzuna API Integration
 * FREE - No credit card required
 * 1000 calls/month free tier
 * 
 * Sources: Aggregates from multiple job boards including LinkedIn
 * Signup: https://developer.adzuna.com/
 */

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY

/**
 * Scrape jobs from Adzuna API
 * @param {Object} preferences - User job preferences
 * @returns {Promise<Array>} Array of job objects
 */
export async function scrapeAdzunaJobs(preferences) {
  try {
    console.log('🔍 Fetching jobs from Adzuna API...')
    
    const query = buildSearchQuery(preferences.keywords)
    const location = preferences.locations?.[0] || 'Remote'
    const country = getCountryCode(location)
    
    // Adzuna API endpoint (US example, change country code as needed)
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`
    
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: '10',
      what: query,
      where: location,
      max_days_old: '7', // Last week only
      sort_by: 'date'
    })
    
    const response = await fetch(`${url}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      console.log('⚠️ No jobs found from Adzuna')
      return []
    }
    
    console.log(`✅ Found ${data.results.length} jobs from Adzuna`)
    
    return data.results.map(job => transformAdzunaJob(job))
    
  } catch (error) {
    console.error('❌ Adzuna API error:', error)
    return []
  }
}

function buildSearchQuery(keywords) {
  if (!keywords || keywords.length === 0) {
    return 'software engineer'
  }
  return keywords.join(' ')
}

function getCountryCode(location) {
  const loc = location.toLowerCase()
  if (loc.includes('us') || loc.includes('united states') || loc.includes('america')) return 'us'
  if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('london')) return 'gb'
  if (loc.includes('canada')) return 'ca'
  if (loc.includes('australia')) return 'au'
  return 'us' // Default to US
}

function transformAdzunaJob(job) {
  return {
    title: job.title || 'Untitled Position',
    company: job.company?.display_name || 'Unknown Company',
    location: job.location?.display_name || 'Location not specified',
    description: job.description || '',
    url: job.redirect_url || '',
    salary_range: formatSalary(job.salary_min, job.salary_max),
    employment_type: job.contract_type || null,
    source: 'Adzuna',
    posted_date: job.created || new Date().toISOString(),
    scraped_at: new Date().toISOString(),
    is_cached: true,
    cache_source: 'adzuna'
  }
}

function formatSalary(min, max) {
  if (!min && !max) return null
  
  const formatAmount = (amount) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`
    }
    return `$${amount}`
  }
  
  if (min && max) {
    return `${formatAmount(min)}-${formatAmount(max)}`
  }
  if (min) return `${formatAmount(min)}+`
  return null
}
