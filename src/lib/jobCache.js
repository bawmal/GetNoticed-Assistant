/**
 * Job Cache Service
 * Implements aggressive caching to maximize free tier usage
 * Target: 85-90% cache hit rate
 */

import { supabase } from './supabase'
import { scrapeJSearchJobs } from './jobScrapers/jSearchScraper'

const CACHE_DURATION_HOURS = 24 // Cache for 24 hours
const POPULAR_SEARCH_CACHE_HOURS = 168 // 7 days for popular searches

/**
 * Get jobs with caching
 * Checks cache first, falls back to API if needed
 */
export async function getJobsWithCache(preferences) {
  try {
    const cacheKey = generateCacheKey(preferences)
    
    console.log('🔍 Checking cache for:', cacheKey)
    
    // Try to get from cache
    const cachedJobs = await getCachedJobs(cacheKey)
    
    if (cachedJobs) {
      console.log('✅ Cache HIT - Returning cached jobs')
      await updateCacheAccess(cacheKey)
      await trackSearch(preferences)
      return cachedJobs
    }
    
    console.log('❌ Cache MISS - Fetching from JSearch API')
    console.log('📡 JSearch API Request:', { keywords: preferences.keywords, locations: preferences.locations })
    
    // Cache miss - fetch from API
    const jobs = await scrapeJSearchJobs(preferences)
    console.log(`📥 JSearch API Response: ${jobs.length} jobs received`)
    
    if (jobs.length > 0) {
      // Store in cache
      await cacheJobs(cacheKey, preferences, jobs)
      await trackSearch(preferences)
    }
    
    return jobs
    
  } catch (error) {
    console.error('❌ Cache service error:', error)
    // Fallback to direct API call
    return await scrapeJSearchJobs(preferences)
  }
}

/**
 * Generate cache key from preferences
 */
function generateCacheKey(preferences) {
  const keywords = (preferences.keywords || []).sort().join('_')
  const location = preferences.locations?.[0] || 'remote'
  const remote = preferences.locations?.includes('Remote') ? 'remote' : 'onsite'
  
  return `${keywords}_${location}_${remote}`.toLowerCase().replace(/\s+/g, '_')
}

/**
 * Get jobs from cache
 */
async function getCachedJobs(cacheKey) {
  try {
    const { data, error } = await supabase
      .from('job_cache')
      .select('jobs_data, job_count, created_at')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !data) {
      return null
    }
    
    console.log(`📦 Cache entry found: ${data.job_count} jobs, age: ${getAge(data.created_at)}`)
    
    return data.jobs_data
    
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

/**
 * Store jobs in cache
 */
async function cacheJobs(cacheKey, searchParams, jobs) {
  try {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS)
    
    const { error } = await supabase
      .from('job_cache')
      .upsert({
        cache_key: cacheKey,
        search_params: searchParams,
        jobs_data: jobs,
        job_count: jobs.length,
        source: 'jsearch',
        expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString(),
        access_count: 1
      }, {
        onConflict: 'cache_key'
      })
    
    if (error) {
      console.error('Error caching jobs:', error)
    } else {
      console.log(`💾 Cached ${jobs.length} jobs (expires in ${CACHE_DURATION_HOURS}h)`)
    }
    
  } catch (error) {
    console.error('Error storing cache:', error)
  }
}

/**
 * Update cache access statistics
 */
async function updateCacheAccess(cacheKey) {
  try {
    await supabase.rpc('increment_cache_access', { p_cache_key: cacheKey })
  } catch (error) {
    // Non-critical, don't throw
    console.warn('Could not update cache access:', error)
  }
}

/**
 * Track search for popularity analytics
 */
async function trackSearch(preferences) {
  try {
    const { error } = await supabase.rpc('track_search', {
      p_keywords: preferences.keywords || [],
      p_location: preferences.locations?.[0] || null
    })
    
    if (error) {
      console.warn('Could not track search:', error)
    }
  } catch (error) {
    // Non-critical
  }
}

/**
 * Get popular searches for pre-fetching
 */
export async function getPopularSearches(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('popular_searches')
      .select('keywords, location, search_count')
      .order('search_count', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return data || []
    
  } catch (error) {
    console.error('Error getting popular searches:', error)
    return []
  }
}

/**
 * Pre-fetch popular searches (run as background job)
 */
export async function prefetchPopularSearches() {
  console.log('🔄 Pre-fetching popular searches...')
  
  const popularSearches = await getPopularSearches(10)
  let prefetched = 0
  
  for (const search of popularSearches) {
    const preferences = {
      keywords: search.keywords,
      locations: search.location ? [search.location] : ['Remote']
    }
    
    const cacheKey = generateCacheKey(preferences)
    
    // Check if already cached
    const cached = await getCachedJobs(cacheKey)
    
    if (!cached) {
      console.log(`📥 Pre-fetching: ${search.keywords.join(', ')} in ${search.location || 'Remote'}`)
      await getJobsWithCache(preferences)
      prefetched++
      
      // Rate limit: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log(`✅ Pre-fetched ${prefetched} popular searches`)
  return prefetched
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    const { data, error } = await supabase
      .from('cache_stats')
      .select('*')
    
    if (error) throw error
    
    return data?.[0] || null
    
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return null
  }
}

/**
 * Clean expired cache entries
 */
export async function cleanExpiredCache() {
  try {
    const { error } = await supabase.rpc('delete_expired_cache')
    
    if (error) throw error
    
    console.log('🧹 Cleaned expired cache entries')
    
  } catch (error) {
    console.error('Error cleaning cache:', error)
  }
}

/**
 * Helper: Get age of cache entry
 */
function getAge(createdAt) {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now - created
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m`
  }
  return `${diffMins}m`
}
