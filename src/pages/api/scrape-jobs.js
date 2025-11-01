/**
 * Simple Job Scraping API - Works with your existing setup
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'POST') {
      const { action } = req.body
      
      if (action === 'clear_and_rescrape') {
        console.log('🧹 API: Clear and rescrape triggered')
        
        // Import the job scraper
        const { jobScraperService } = await import('../../lib/jobScraper.js')
        
        try {
          // Clear cache first
          console.log('🗑️ Clearing job cache...')
          const { supabase } = await import('../../lib/supabase.js')
          
          await supabase
            .from('scraped_jobs')
            .delete()
            .eq('user_id', 'CACHED')
          
          console.log('✅ Cache cleared')
          
          // Run enhanced scraping
          console.log('🚀 Running enhanced job scraping...')
          const jobs = await jobScraperService.runDailyJobUpdate()
          
          console.log(`✅ Scraping complete: ${jobs.length} jobs found`)
          
          return res.status(200).json({
            success: true,
            message: `✅ Job update completed! Processed ${jobs.length} jobs`,
            jobsProcessed: jobs.length,
            timestamp: new Date().toISOString()
          })
          
        } catch (scrapingError) {
          console.error('❌ Scraping failed:', scrapingError)
          
          return res.status(500).json({
            success: false,
            error: 'Scraping failed',
            message: scrapingError.message,
            timestamp: new Date().toISOString()
          })
        }
      }
      
      if (action === 'get_stats') {
        console.log('📊 API: Getting job statistics')
        
        try {
          const { supabase } = await import('../../lib/supabase.js')
          
          // Get cached job count
          const { data: cachedJobs, error } = await supabase
            .from('scraped_jobs')
            .select('source, scraped_at')
            .eq('user_id', 'CACHED')
            .gte('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          
          if (error) throw error
          
          // Calculate stats
          const jobsBySource = {}
          cachedJobs?.forEach(job => {
            jobsBySource[job.source] = (jobsBySource[job.source] || 0) + 1
          })
          
          const stats = {
            totalCachedJobs: cachedJobs?.length || 0,
            lastUpdated: cachedJobs?.[0]?.scraped_at || null,
            jobsBySource,
            status: cachedJobs?.length > 0 ? 'healthy' : 'warning',
            timestamp: new Date().toISOString()
          }
          
          return res.status(200).json(stats)
          
        } catch (statsError) {
          console.error('❌ Stats failed:', statsError)
          
          return res.status(500).json({
            error: 'Failed to get statistics',
            message: statsError.message
          })
        }
      }
      
      return res.status(400).json({ error: 'Invalid action' })
    }
    
    // GET request - return basic info
    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Job Scraping API is running',
        availableActions: ['clear_and_rescrape', 'get_stats'],
        timestamp: new Date().toISOString()
      })
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
