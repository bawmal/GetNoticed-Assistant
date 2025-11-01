/**
 * Simple Job Scraping Controls - Works with existing setup
 */

import React, { useState, useEffect } from 'react'
import { RefreshCw, Database, BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react'

const SimpleJobControls = ({ onJobsUpdated }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState(null)

  // Load stats on component mount
  useEffect(() => {
    loadStats()
  }, [])

  /**
   * Load job statistics directly from Supabase
   */
  const loadStats = async () => {
    try {
      const { supabase } = await import('../lib/supabase')
      
      // Get cached job count
      const { data: cachedJobs, error } = await supabase
        .from('scraped_jobs')
        .select('source, scraped_at')
        .eq('is_cached', true)
        .gte('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      
      if (error) throw error
      
      // Calculate stats
      const jobsBySource = {}
      cachedJobs?.forEach(job => {
        jobsBySource[job.source] = (jobsBySource[job.source] || 0) + 1
      })
      
      const statsData = {
        totalCachedJobs: cachedJobs?.length || 0,
        lastUpdated: cachedJobs?.[0]?.scraped_at || null,
        jobsBySource,
        status: cachedJobs?.length > 0 ? 'healthy' : 'warning',
        timestamp: new Date().toISOString()
      }
      
      setStats(statsData)
      
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats({
        totalCachedJobs: 0,
        lastUpdated: null,
        jobsBySource: {},
        status: 'error',
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Trigger clear and rescrape directly
   */
  const triggerClearAndRescrape = async () => {
    setIsLoading(true)
    setMessage('🧹 Clearing cache and starting enhanced scraping...')

    try {
      // Import the job scraper
      const { jobScraperService } = await import('../lib/jobScraper')
      const { supabase } = await import('../lib/supabase')
      
      // Step 1: Clear cache
      setMessage('🗑️ Clearing job cache...')
      await supabase
        .from('scraped_jobs')
        .delete()
        .eq('is_cached', true)
      
      console.log('✅ Cache cleared')
      
      // Step 2: Run enhanced scraping
      setMessage('🚀 Running enhanced multi-method job scraping...')
      console.log('🚀 Starting enhanced scraping with LinkedIn post techniques...')
      
      const jobs = await jobScraperService.runDailyJobUpdate()
      
      console.log(`✅ Scraping complete: ${jobs.length} jobs found`)
      
      // Step 3: Show results
      const freeJobs = jobs.filter(job => 
        ['remoteok', 'weworkremotely', 'hackernews', 'remotive', 'wellfound', 
         'stackoverflow', 'authenticjobs', 'workingnomads', 'jobspresso'].includes(job.source)
      )
      
      const atsJobs = jobs.filter(job => 
        job.source.startsWith('ats_') || job.source === 'greenhouse' || job.source === 'lever'
      )
      
      const websiteJobs = jobs.filter(job => 
        job.source === 'company_website'
      )
      
      const jobBoardJobs = jobs.filter(job => 
        job.source.startsWith('jobboard_')
      )
      
      setMessage(`✅ Enhanced scraping complete! Found ${jobs.length} total jobs:
      🆓 Free sources: ${freeJobs.length}
      🏢 ATS platforms: ${atsJobs.length} 
      🌐 Company websites: ${websiteJobs.length}
      📋 Job boards: ${jobBoardJobs.length}`)
      
      // Refresh stats and notify parent to reload jobs
      await loadStats()
      
      // Trigger job reload in parent component
      if (onJobsUpdated) {
        onJobsUpdated()
      }
      
    } catch (error) {
      console.error('❌ Scraping failed:', error)
      setMessage(`❌ Scraping failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Debug database to see what's happening
   */
  const debugDatabase = async () => {
    try {
      const { supabase } = await import('../lib/supabase')
      
      console.log('🔍 DEBUG: Checking database...')
      
      // Check all jobs
      const { data: allJobs, error: allError } = await supabase
        .from('scraped_jobs')
        .select('id, user_id, is_cached, source, title, company, scraped_at')
        .order('scraped_at', { ascending: false })
        .limit(10)
      
      console.log('📊 All jobs:', { 
        count: allJobs?.length || 0, 
        error: allError?.message,
        sample: allJobs?.[0]
      })
      
      // Check cached jobs specifically
      const { data: cachedJobs, error: cachedError } = await supabase
        .from('scraped_jobs')
        .select('*')
        .eq('is_cached', true)
        .limit(5)
      
      console.log('💾 Cached jobs:', { 
        count: cachedJobs?.length || 0, 
        error: cachedError?.message,
        sample: cachedJobs?.[0]
      })
      
      // Test different queries
      const { data: anyJobs, error: anyError } = await supabase
        .from('scraped_jobs')
        .select('count')
      
      console.log('🔢 Total count:', { 
        result: anyJobs,
        error: anyError?.message
      })
      
      setMessage(`🔍 Debug complete - check console. Found ${allJobs?.length || 0} total jobs, ${cachedJobs?.length || 0} cached jobs`)
      
    } catch (error) {
      console.error('❌ Debug failed:', error)
      setMessage(`❌ Debug failed: ${error.message}`)
    }
  }

  /**
   * Fix existing jobs to be marked as cached
   */
  const fixExistingJobs = async () => {
    try {
      const { supabase } = await import('../lib/supabase')
      
      setMessage('🔧 Fixing existing jobs to be marked as cached...')
      console.log('🔧 Marking existing jobs as cached...')
      
      // Update recent jobs to be marked as cached
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('scraped_jobs')
        .update({ is_cached: true })
        .gte('scraped_at', oneDayAgo)
        .select('id')
      
      if (error) throw error
      
      console.log(`✅ Fixed ${data?.length || 0} jobs`)
      setMessage(`✅ Fixed ${data?.length || 0} jobs! Now marked as cached.`)
      
      // Refresh stats and trigger job reload
      await loadStats()
      if (onJobsUpdated) {
        onJobsUpdated()
      }
      
    } catch (error) {
      console.error('❌ Fix failed:', error)
      setMessage(`❌ Fix failed: ${error.message}`)
    }
  }

  /**
   * Format last update time
   */
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Less than 1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }

  /**
   * Get status color
   */
  const getStatusColor = () => {
    if (!stats) return 'text-gray-500'
    
    switch (stats.status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="mb-4 space-y-3">
      <button
        onClick={triggerClearAndRescrape}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all shadow-sm"
      >
        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Refreshing Jobs...' : 'Refresh Jobs'}</span>
      </button>
      
      {stats && stats.totalCachedJobs === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Database className="text-blue-600 mt-0.5" size={16} />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">No Jobs Cached</p>
              <p className="text-blue-700">
                Click "Refresh Jobs" to fetch the latest job listings from multiple sources.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {message && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          {message}
        </div>
      )}
    </div>
  )
}

export default SimpleJobControls
