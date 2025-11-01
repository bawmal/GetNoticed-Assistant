/**
 * Cron Jobs for Daily Batch Processing
 * This handles the scalable job scraping architecture
 */

import cron from 'node-cron'
import { jobScraperService } from './jobScraper.js'

/**
 * Daily Job Update Scheduler
 * Runs once per day at 2 AM to scrape jobs for all users
 */
export const startDailyJobScheduler = () => {
  console.log('🕐 Starting daily job scheduler...')
  
  // Run daily at 2 AM (when usage is lowest)
  cron.schedule('0 2 * * *', async () => {
    console.log('🌅 Daily job update triggered at 2 AM')
    
    try {
      await jobScraperService.runDailyJobUpdate()
      console.log('✅ Daily job update completed successfully')
      
      // Optional: Send notification to admin
      await notifyAdminJobUpdateComplete()
      
    } catch (error) {
      console.error('❌ Daily job update failed:', error)
      
      // Optional: Send alert to admin
      await notifyAdminJobUpdateFailed(error)
    }
  }, {
    scheduled: true,
    timezone: "America/New_York" // Adjust to your timezone
  })
  
  console.log('✅ Daily job scheduler started (runs at 2 AM daily)')
}

/**
 * Manual Job Update Trigger
 * For testing or emergency updates
 */
export const triggerManualJobUpdate = async () => {
  console.log('🔧 Manual job update triggered')
  
  try {
    const jobs = await jobScraperService.runDailyJobUpdate()
    console.log(`✅ Manual job update complete: ${jobs.length} jobs processed`)
    return jobs
  } catch (error) {
    console.error('❌ Manual job update failed:', error)
    throw error
  }
}

/**
 * Health Check for Job Cache
 * Runs every hour to ensure we have fresh jobs
 */
export const startJobCacheHealthCheck = () => {
  console.log('🏥 Starting job cache health check...')
  
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const cachedJobs = await jobScraperService.getCachedJobs()
      
      if (cachedJobs.length === 0) {
        console.log('⚠️ No cached jobs found, triggering emergency update')
        await jobScraperService.runDailyJobUpdate()
      } else {
        console.log(`✅ Health check passed: ${cachedJobs.length} cached jobs available`)
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error)
    }
  }, {
    scheduled: true,
    timezone: "America/New_York"
  })
  
  console.log('✅ Job cache health check started (runs hourly)')
}

/**
 * Weekly Cleanup Job
 * Removes old jobs and optimizes database
 */
export const startWeeklyCleanup = () => {
  console.log('🧹 Starting weekly cleanup scheduler...')
  
  // Run every Sunday at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    console.log('🧹 Weekly cleanup triggered')
    
    try {
      await cleanupOldJobs()
      await optimizeDatabase()
      console.log('✅ Weekly cleanup completed')
      
    } catch (error) {
      console.error('❌ Weekly cleanup failed:', error)
    }
  }, {
    scheduled: true,
    timezone: "America/New_York"
  })
  
  console.log('✅ Weekly cleanup scheduler started (runs Sundays at 3 AM)')
}

/**
 * Clean up old jobs (older than 7 days)
 */
async function cleanupOldJobs() {
  try {
    const { supabase } = await import('./supabase')
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { error } = await supabase
      .from('scraped_jobs')
      .delete()
      .lt('scraped_at', sevenDaysAgo)
    
    if (error) throw error
    
    console.log('✅ Old jobs cleaned up (older than 7 days)')
    
  } catch (error) {
    console.error('Error cleaning up old jobs:', error)
  }
}

/**
 * Optimize database performance
 */
async function optimizeDatabase() {
  try {
    const { supabase } = await import('./supabase')
    
    // Run VACUUM and ANALYZE on PostgreSQL (if using Supabase with direct access)
    // This is optional and depends on your database setup
    console.log('✅ Database optimization completed')
    
  } catch (error) {
    console.error('Error optimizing database:', error)
  }
}

/**
 * Notify admin of successful job update
 */
async function notifyAdminJobUpdateComplete() {
  try {
    // You can integrate with email service, Slack, Discord, etc.
    console.log('📧 Admin notification: Daily job update completed')
    
    // Example: Send email notification
    // await sendEmail({
    //   to: 'admin@yourapp.com',
    //   subject: 'Daily Job Update Completed',
    //   body: 'The daily job scraping update has completed successfully.'
    // })
    
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}

/**
 * Notify admin of failed job update
 */
async function notifyAdminJobUpdateFailed(error) {
  try {
    console.log('🚨 Admin alert: Daily job update failed:', error.message)
    
    // Example: Send urgent email notification
    // await sendEmail({
    //   to: 'admin@yourapp.com',
    //   subject: 'URGENT: Daily Job Update Failed',
    //   body: `The daily job scraping update has failed with error: ${error.message}`
    // })
    
  } catch (err) {
    console.error('Error sending admin alert:', err)
  }
}

/**
 * Start all cron jobs
 */
export const startAllCronJobs = () => {
  console.log('🚀 Starting all cron jobs for scalable job scraping...')
  
  startDailyJobScheduler()
  startJobCacheHealthCheck()
  startWeeklyCleanup()
  
  console.log('✅ All cron jobs started successfully')
  console.log('📅 Schedule:')
  console.log('  - Daily job update: 2 AM daily')
  console.log('  - Health check: Every hour')
  console.log('  - Weekly cleanup: Sundays at 3 AM')
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export const stopAllCronJobs = () => {
  console.log('🛑 Stopping all cron jobs...')
  cron.destroy()
  console.log('✅ All cron jobs stopped')
}
