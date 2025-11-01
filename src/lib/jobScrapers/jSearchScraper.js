/**
 * JSearch API Integration
 * Free Tier: 100 requests/month (~1,000 jobs)
 * 
 * Sources: LinkedIn, Indeed, Glassdoor, ZipRecruiter, Monster, CareerBuilder
 */

const JSEARCH_API_URL = 'https://jsearch.p.rapidapi.com/search'
const JSEARCH_API_KEY = import.meta.env.VITE_JSEARCH_API_KEY

/**
 * Scrape jobs from JSearch API
 * @param {Object} preferences - User job preferences
 * @returns {Promise<Array>} Array of job objects
 */
export async function scrapeJSearchJobs(preferences) {
  try {
    console.log('🔍 Fetching jobs from JSearch API...')
    console.log('🔑 Environment check:', {
      hasApiKey: !!JSEARCH_API_KEY,
      keyLength: JSEARCH_API_KEY?.length || 0,
      keyPreview: JSEARCH_API_KEY ? `${JSEARCH_API_KEY.substring(0, 10)}...` : 'NOT FOUND',
      allEnvVars: Object.keys(import.meta.env).filter(key => key.includes('JSEARCH'))
    })
    
    if (!JSEARCH_API_KEY) {
      console.error('❌ VITE_JSEARCH_API_KEY not found in environment!')
      console.error('Available env vars:', Object.keys(import.meta.env))
      return []
    }
    
    // Build search query from keywords
    const query = buildSearchQuery(preferences.keywords)
    const location = preferences.locations?.[0] || 'Remote'
    
    // Build API request
    const params = new URLSearchParams({
      query: query,
      page: '1',
      num_pages: '5', // 5 pages = ~50 jobs (5 API calls per refresh, good balance)
      date_posted: 'month', // Last month for more results
      remote_jobs_only: preferences.locations?.includes('Remote') ? 'true' : 'false'
    })
    
    // Add location if not remote-only
    if (!preferences.locations?.includes('Remote')) {
      params.append('location', location)
    }
    
    const url = `${JSEARCH_API_URL}?${params.toString()}`
    
    console.log('📡 JSearch API Request:', {
      query,
      location,
      remote_only: params.get('remote_jobs_only')
    })
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })
    
    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      console.log('⚠️ No jobs found from JSearch')
      return []
    }
    
    console.log(`✅ Found ${data.data.length} jobs from JSearch`)
    console.log('📊 Sources:', [...new Set(data.data.map(j => j.job_publisher))])
    
    // Transform to our format
    const jobs = data.data.map(job => transformJSearchJob(job))
    
    return jobs
    
  } catch (error) {
    console.error('❌ JSearch API error:', error)
    
    // Return empty array on error (don't break the app)
    return []
  }
}

/**
 * Build search query from keywords
 */
function buildSearchQuery(keywords) {
  if (!keywords || keywords.length === 0) {
    return 'software engineer' // Default fallback
  }
  
  // Join keywords with OR for broader results
  // e.g., ["product", "manager"] → "product OR manager"
  return keywords.join(' OR ')
}

/**
 * Transform JSearch job to our format
 */
function transformJSearchJob(job) {
  return {
    // Core fields
    title: job.job_title || 'Untitled Position',
    company: job.employer_name || 'Unknown Company',
    location: formatLocation(job),
    description: job.job_description || '',
    url: job.job_apply_link || job.job_google_link || '',
    
    // Additional fields
    salary_range: formatSalary(job.job_min_salary, job.job_max_salary),
    employment_type: formatEmploymentType(job.job_employment_type),
    source: job.job_publisher || 'JSearch',
    
    // Metadata
    posted_date: job.job_posted_at_datetime_utc || new Date().toISOString(),
    scraped_at: new Date().toISOString(),
    is_remote: job.job_is_remote || false,
    
    // Database required fields
    external_id: job.job_id || `jsearch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    job_id: job.job_id,
    
    // JSearch specific
    employer_logo: job.employer_logo,
    employer_website: job.employer_website,
    job_highlights: job.job_highlights,
    
    // For caching
    is_cached: true,
    cache_source: 'jsearch'
  }
}

/**
 * Format location from JSearch data
 */
function formatLocation(job) {
  const parts = []
  
  if (job.job_city) parts.push(job.job_city)
  if (job.job_state) parts.push(job.job_state)
  if (job.job_country) parts.push(job.job_country)
  
  let location = parts.join(', ') || 'Location not specified'
  
  // Add "Remote" prefix if remote job
  if (job.job_is_remote) {
    location = `Remote - ${location}`
  }
  
  return location
}

/**
 * Format salary range
 */
function formatSalary(minSalary, maxSalary) {
  if (!minSalary && !maxSalary) return null
  
  const formatAmount = (amount) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`
    }
    return `$${amount}`
  }
  
  if (minSalary && maxSalary) {
    return `${formatAmount(minSalary)}-${formatAmount(maxSalary)}`
  }
  
  if (minSalary) {
    return `${formatAmount(minSalary)}+`
  }
  
  if (maxSalary) {
    return `Up to ${formatAmount(maxSalary)}`
  }
  
  return null
}

/**
 * Format employment type
 */
function formatEmploymentType(type) {
  if (!type) return null
  
  const typeMap = {
    'FULLTIME': 'Full-time',
    'PARTTIME': 'Part-time',
    'CONTRACTOR': 'Contract',
    'INTERN': 'Internship'
  }
  
  return typeMap[type] || type
}

/**
 * Get estimated API usage
 * Free tier: 100 requests/month
 */
export function getAPIUsageEstimate(userCount, searchesPerUser = 2) {
  const totalSearches = userCount * searchesPerUser
  const cacheHitRate = 0.85 // 85% cache hit rate
  const apiRequests = Math.ceil(totalSearches * (1 - cacheHitRate))
  
  return {
    totalSearches,
    cacheHitRate: `${cacheHitRate * 100}%`,
    apiRequests,
    freeTierLimit: 100,
    withinLimit: apiRequests <= 100,
    estimatedCost: apiRequests > 100 ? '$20/month (Basic plan)' : '$0 (Free tier)'
  }
}
