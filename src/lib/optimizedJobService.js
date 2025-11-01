/**
 * Optimized Job Service for Scalable Architecture
 * This handles user requests with instant responses using cached data
 */

import { jobScraperService } from './jobScraper.js'

/**
 * Get jobs for a user (optimized for instant response)
 * @param {string} userId - User ID
 * @param {Object} userPreferences - User's job preferences
 */
export const getJobsForUser = async (userId, userPreferences = null) => {
  try {
    console.log(`🚀 Getting jobs for user ${userId} (optimized)`)
    const startTime = Date.now()
    
    // 1. Load user preferences if not provided
    if (!userPreferences) {
      userPreferences = await jobScraperService.loadUserPreferences(userId)
    }
    
    // 2. Get cached jobs from daily batch processing (instant)
    const cachedJobs = await jobScraperService.getCachedJobs()
    
    if (cachedJobs.length === 0) {
      console.log('⚠️ No cached jobs available, falling back to live scraping')
      return await jobScraperService.scrapeJobs({ user_id: userId })
    }
    
    // 3. Filter jobs based on user preferences (instant)
    const filteredJobs = jobScraperService.filterJobsByPreferences(cachedJobs, userPreferences)
    
    // 4. Prioritize target company jobs (instant)
    const prioritizedJobs = jobScraperService.prioritizeTargetCompanies(
      filteredJobs, 
      userPreferences.target_companies || []
    )
    
    // 5. Add user-specific enhancements
    const enhancedJobs = await addUserSpecificEnhancements(prioritizedJobs, userPreferences)
    
    const responseTime = Date.now() - startTime
    console.log(`✅ Returned ${enhancedJobs.length} jobs in ${responseTime}ms (cached)`)
    
    return enhancedJobs
    
  } catch (error) {
    console.error('Error getting jobs for user:', error)
    throw error
  }
}

/**
 * Add user-specific enhancements to jobs
 * @param {Array} jobs - Filtered jobs
 * @param {Object} userPreferences - User preferences
 */
async function addUserSpecificEnhancements(jobs, userPreferences) {
  try {
    // Add fit scores, mark as new, etc.
    const enhancedJobs = jobs.map(job => ({
      ...job,
      is_new: isJobNew(job),
      fit_score: calculateFitScore(job, userPreferences),
      user_notes: null // Placeholder for user-specific notes
    }))
    
    return enhancedJobs
    
  } catch (error) {
    console.error('Error enhancing jobs:', error)
    return jobs // Return original jobs if enhancement fails
  }
}

/**
 * Check if job is new (posted in last 24 hours)
 * @param {Object} job - Job object
 */
function isJobNew(job) {
  try {
    const postedDate = new Date(job.posted_date)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return postedDate > oneDayAgo
  } catch (error) {
    return false
  }
}

/**
 * Calculate basic fit score for job
 * @param {Object} job - Job object
 * @param {Object} userPreferences - User preferences
 */
function calculateFitScore(job, userPreferences) {
  try {
    let score = 0
    
    // Keyword matching (40 points)
    if (userPreferences.keywords) {
      const keywordMatches = userPreferences.keywords.filter(keyword =>
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase())
      )
      score += (keywordMatches.length / userPreferences.keywords.length) * 40
    }
    
    // Location matching (20 points)
    if (userPreferences.locations) {
      const locationMatch = userPreferences.locations.some(location =>
        job.location.toLowerCase().includes(location.toLowerCase()) ||
        job.location.toLowerCase().includes('remote')
      )
      if (locationMatch) score += 20
    }
    
    // Target company bonus (30 points)
    if (userPreferences.target_companies) {
      const isTargetCompany = userPreferences.target_companies.some(company =>
        job.company.toLowerCase().includes(company.toLowerCase())
      )
      if (isTargetCompany) score += 30
    }
    
    // Salary matching (10 points)
    if (userPreferences.min_salary && job.salary_range) {
      const salaryMatch = job.salary_range.match(/\$?([\d,]+)/)
      if (salaryMatch) {
        const jobSalary = parseInt(salaryMatch[1].replace(/,/g, ''))
        if (jobSalary >= userPreferences.min_salary) score += 10
      }
    }
    
    return Math.min(Math.round(score), 100) // Cap at 100
    
  } catch (error) {
    return 50 // Default score if calculation fails
  }
}

/**
 * Get job statistics for admin dashboard
 */
export const getJobStatistics = async () => {
  try {
    const { supabase } = await import('./supabase')
    
    // Get cached job statistics
    const { data: cachedJobs, error: cachedError } = await supabase
      .from('scraped_jobs')
      .select('source, scraped_at')
      .eq('user_id', 'CACHED')
      .gte('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    if (cachedError) throw cachedError
    
    // Get unique target companies
    const uniqueCompanies = await jobScraperService.getAllUniqueTargetCompanies()
    
    // Calculate statistics
    const stats = {
      totalCachedJobs: cachedJobs?.length || 0,
      lastUpdated: cachedJobs?.[0]?.scraped_at || null,
      jobsBySource: {},
      uniqueTargetCompanies: uniqueCompanies.length,
      targetCompanies: uniqueCompanies
    }
    
    // Group jobs by source
    if (cachedJobs) {
      cachedJobs.forEach(job => {
        stats.jobsBySource[job.source] = (stats.jobsBySource[job.source] || 0) + 1
      })
    }
    
    return stats
    
  } catch (error) {
    console.error('Error getting job statistics:', error)
    return {
      totalCachedJobs: 0,
      lastUpdated: null,
      jobsBySource: {},
      uniqueTargetCompanies: 0,
      targetCompanies: []
    }
  }
}

/**
 * Force refresh jobs for a specific user (emergency use)
 * @param {string} userId - User ID
 */
export const forceRefreshUserJobs = async (userId) => {
  try {
    console.log(`🔄 Force refreshing jobs for user ${userId}`)
    
    // Run live scraping for this specific user
    const jobs = await jobScraperService.scrapeJobs({ user_id: userId })
    
    console.log(`✅ Force refresh complete: ${jobs.length} jobs found`)
    return jobs
    
  } catch (error) {
    console.error('Error force refreshing user jobs:', error)
    throw error
  }
}

/**
 * Check system health
 */
export const checkSystemHealth = async () => {
  try {
    const stats = await getJobStatistics()
    
    const health = {
      status: 'healthy',
      cachedJobsAvailable: stats.totalCachedJobs > 0,
      lastUpdate: stats.lastUpdated,
      issues: []
    }
    
    // Check for issues
    if (stats.totalCachedJobs === 0) {
      health.status = 'warning'
      health.issues.push('No cached jobs available')
    }
    
    if (stats.lastUpdated) {
      const lastUpdate = new Date(stats.lastUpdated)
      const hoursAgo = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      if (hoursAgo > 25) { // More than 25 hours ago
        health.status = 'warning'
        health.issues.push(`Jobs last updated ${Math.round(hoursAgo)} hours ago`)
      }
    }
    
    return health
    
  } catch (error) {
    return {
      status: 'error',
      cachedJobsAvailable: false,
      lastUpdate: null,
      issues: ['System health check failed']
    }
  }
}
