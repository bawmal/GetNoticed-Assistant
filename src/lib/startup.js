/**
 * Application Startup Script
 * Initializes the scalable job scraping system
 */

import { startAllCronJobs, triggerManualJobUpdate } from './cronJobs.js'
import { checkSystemHealth } from './optimizedJobService.js'

/**
 * Initialize the scalable job scraping system
 */
export const initializeJobScrapingSystem = async () => {
  console.log('🚀 Initializing scalable job scraping system...')
  
  try {
    // 1. Check system health
    console.log('🏥 Checking system health...')
    const health = await checkSystemHealth()
    
    if (health.status === 'error') {
      console.log('❌ System health check failed, but continuing with initialization')
    } else {
      console.log(`✅ System health: ${health.status}`)
      if (health.issues.length > 0) {
        console.log('⚠️ Issues found:', health.issues)
      }
    }
    
    // 2. Start cron jobs
    console.log('⏰ Starting scheduled job processing...')
    startAllCronJobs()
    
    // 3. Check if we need an initial job update
    if (!health.cachedJobsAvailable) {
      console.log('🔄 No cached jobs found, triggering initial job update...')
      
      try {
        await triggerManualJobUpdate()
        console.log('✅ Initial job update completed')
      } catch (error) {
        console.log('⚠️ Initial job update failed, will retry on next scheduled run:', error.message)
      }
    } else {
      console.log('✅ Cached jobs available, system ready')
    }
    
    console.log('🎉 Job scraping system initialized successfully!')
    console.log('')
    console.log('📊 System Overview:')
    console.log('  - Cached jobs available:', health.cachedJobsAvailable)
    console.log('  - Last update:', health.lastUpdate || 'Never')
    console.log('  - Daily updates: 2 AM (automatic)')
    console.log('  - Health checks: Every hour')
    console.log('  - Weekly cleanup: Sundays 3 AM')
    console.log('')
    
    return {
      success: true,
      health,
      message: 'Job scraping system initialized successfully'
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize job scraping system:', error)
    
    return {
      success: false,
      error: error.message,
      message: 'Job scraping system initialization failed'
    }
  }
}

/**
 * Graceful shutdown of the job scraping system
 */
export const shutdownJobScrapingSystem = async () => {
  console.log('🛑 Shutting down job scraping system...')
  
  try {
    const { stopAllCronJobs } = await import('./cronJobs.js')
    stopAllCronJobs()
    
    console.log('✅ Job scraping system shut down successfully')
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
  }
}

/**
 * Get system status for monitoring
 */
export const getSystemStatus = async () => {
  try {
    const health = await checkSystemHealth()
    const { getJobStatistics } = await import('./optimizedJobService.js')
    const stats = await getJobStatistics()
    
    return {
      health,
      statistics: stats,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      health: { status: 'error', issues: ['Failed to get system status'] },
      statistics: null,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      error: error.message
    }
  }
}

// Auto-initialize if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeJobScrapingSystem()
    .then(result => {
      if (result.success) {
        console.log('✅ Startup completed successfully')
      } else {
        console.log('❌ Startup failed:', result.message)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Startup error:', error)
      process.exit(1)
    })
}
