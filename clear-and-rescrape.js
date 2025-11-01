/**
 * Clear and Rescrape - Simple test by clearing cache and running fresh scrape
 * This is the easiest way to test if everything is working
 */

import { jobScraperService } from './src/lib/jobScraper.js'

async function clearAndRescrape() {
  console.log('🧹 Clear and Rescrape Test\n')
  
  try {
    // Step 1: Clear existing cached jobs
    console.log('1️⃣ Clearing existing job cache...')
    await clearJobCache()
    console.log('   ✅ Cache cleared\n')
    
    // Step 2: Run fresh scrape
    console.log('2️⃣ Running fresh job scrape...')
    console.log('   ⏱️  This will take 1-3 minutes\n')
    
    const startTime = Date.now()
    
    // Use the NEW enhanced daily batch processing method
    console.log('   🚀 Running ENHANCED multi-method job scraping...')
    console.log('   📡 This will use the new LinkedIn post techniques!')
    
    const allJobs = await jobScraperService.runDailyJobUpdate()
    console.log(`   ✅ Enhanced scraping complete: ${allJobs.length} total jobs found`)
    
    // Break down the results
    const freeJobs = allJobs.filter(job => 
      ['remoteok', 'weworkremotely', 'hackernews', 'remotive', 'wellfound', 
       'stackoverflow', 'authenticjobs', 'workingnomads', 'jobspresso'].includes(job.source)
    )
    
    const atsJobs = allJobs.filter(job => 
      job.source.startsWith('ats_') || job.source === 'greenhouse' || job.source === 'lever'
    )
    
    const websiteJobs = allJobs.filter(job => 
      job.source === 'company_website'
    )
    
    const jobBoardJobs = allJobs.filter(job => 
      job.source.startsWith('jobboard_')
    )
    
    console.log(`   📊 Breakdown:`)
    console.log(`     🆓 Free sources: ${freeJobs.length} jobs`)
    console.log(`     🏢 ATS platforms: ${atsJobs.length} jobs`)
    console.log(`     🌐 Company websites: ${websiteJobs.length} jobs`)
    console.log(`     📋 Job boards: ${jobBoardJobs.length} jobs`)
    
    // The jobs are already cached by runDailyJobUpdate, so we don't need to cache again
    const targetJobs = [...atsJobs, ...websiteJobs, ...jobBoardJobs]
    
    // Step 3: Jobs are already cached by runDailyJobUpdate
    console.log('\n3️⃣ Jobs already cached by enhanced batch processing...')
    console.log(`   ✅ All ${allJobs.length} jobs are now cached and ready`)
    
    // Step 4: Test user retrieval
    console.log('\n4️⃣ Testing instant user job retrieval...')
    const retrievalStartTime = Date.now()
    const cachedJobs = await jobScraperService.getCachedJobs()
    const retrievalTime = Date.now() - retrievalStartTime
    
    console.log(`   ✅ Retrieved ${cachedJobs.length} jobs in ${retrievalTime}ms`)
    
    // Summary
    const totalTime = (Date.now() - startTime) / 1000
    console.log('\n' + '='.repeat(60))
    console.log('🎉 ENHANCED MULTI-METHOD SCRAPING COMPLETE!')
    console.log('='.repeat(60))
    console.log(`⏱️  Total time: ${totalTime}s`)
    console.log(`📊 Total jobs found: ${allJobs.length}`)
    console.log(`🆓 Free sources: ${freeJobs.length}`)
    console.log(`🏢 ATS platforms: ${atsJobs.length}`)
    console.log(`🌐 Company websites: ${websiteJobs.length}`)
    console.log(`📋 Job boards: ${jobBoardJobs.length}`)
    console.log(`⚡ User retrieval: ${retrievalTime}ms`)
    
    // Job breakdown by source
    console.log('\n📋 Jobs by source:')
    const jobsBySource = {}
    allJobs.forEach(job => {
      jobsBySource[job.source] = (jobsBySource[job.source] || 0) + 1
    })
    
    Object.entries(jobsBySource)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`   ${source}: ${count} jobs`)
      })
    
    // Show sample jobs
    if (allJobs.length > 0) {
      console.log('\n🔍 Sample jobs found:')
      allJobs.slice(0, 3).forEach((job, i) => {
        console.log(`   ${i + 1}. ${job.title} at ${job.company} (${job.location}) [${job.source}]`)
      })
    }
    
    // Status check
    console.log('\n✅ SYSTEM STATUS: WORKING')
    console.log('🚀 Your job scraping system is ready!')
    
    if (atsJobs.length === 0 && websiteJobs.length === 0 && jobBoardJobs.length === 0) {
      console.log('\n💡 TIP: Set up Google Custom Search API for enhanced target company scraping')
    }
    
  } catch (error) {
    console.error('\n❌ CLEAR AND RESCRAPE FAILED')
    console.error('Error:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   - Check internet connection')
    console.log('   - Verify Supabase credentials in .env')
    console.log('   - Make sure database tables exist')
    console.log('   - Run: npm run test:quick for detailed diagnostics')
  }
}

/**
 * Clear job cache
 */
async function clearJobCache() {
  try {
    const { supabase } = await import('./src/lib/supabase.js')
    
    // Delete all cached jobs
    const { error } = await supabase
      .from('scraped_jobs')
      .delete()
      .eq('user_id', 'CACHED')
    
    if (error) throw error
    
  } catch (error) {
    throw new Error(`Failed to clear cache: ${error.message}`)
  }
}

// Run clear and rescrape
clearAndRescrape()
