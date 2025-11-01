/**
 * Manual Scrape Script - Trigger job scraping manually
 * Use this to test scraping or populate the job cache
 */

import { triggerManualJobUpdate } from './src/lib/cronJobs.js'
import { jobScraperService } from './src/lib/jobScraper.js'

async function manualScrape() {
  console.log('🔧 Manual Job Scraping Started\n')
  
  const args = process.argv.slice(2)
  const mode = args[0] || 'full'
  
  try {
    if (mode === 'quick') {
      await quickScrape()
    } else if (mode === 'companies') {
      await companyScrape()
    } else if (mode === 'free') {
      await freeScrape()
    } else {
      await fullScrape()
    }
    
  } catch (error) {
    console.error('❌ Manual scrape failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   - Check internet connection')
    console.log('   - Verify Supabase credentials')
    console.log('   - Check Google API setup (for company scraping)')
    process.exit(1)
  }
}

/**
 * Full scrape - complete daily update
 */
async function fullScrape() {
  console.log('🌅 Running full daily job update...')
  console.log('⏱️  This may take 2-5 minutes\n')
  
  const startTime = Date.now()
  const jobs = await triggerManualJobUpdate()
  const duration = (Date.now() - startTime) / 1000
  
  console.log(`\n✅ Full scrape completed in ${duration}s`)
  console.log(`📊 Total jobs processed: ${jobs.length}`)
  console.log('💾 Jobs cached for instant user access')
}

/**
 * Quick scrape - free sources only
 */
async function freeScrape() {
  console.log('🆓 Scraping free job sources only...')
  console.log('⏱️  This may take 30-60 seconds\n')
  
  const startTime = Date.now()
  const jobs = await jobScraperService.scrapeAllFreeSources()
  
  // Cache the results
  await jobScraperService.cacheJobsForUsers(jobs)
  
  const duration = (Date.now() - startTime) / 1000
  
  console.log(`\n✅ Free sources scrape completed in ${duration}s`)
  console.log(`📊 Jobs found: ${jobs.length}`)
  console.log('💾 Jobs cached for instant user access')
}

/**
 * Company scrape - target companies only
 */
async function companyScrape() {
  console.log('🎯 Scraping target companies only...')
  console.log('⏱️  This may take 1-2 minutes\n')
  
  const startTime = Date.now()
  
  // Get target companies
  const companies = await jobScraperService.getAllUniqueTargetCompanies()
  console.log(`🏢 Found ${companies.length} target companies`)
  
  if (companies.length === 0) {
    console.log('⚠️  No target companies found. Add some companies in user preferences first.')
    return
  }
  
  // Scrape target companies
  const jobs = await jobScraperService.batchGoogleSearchTargetCompanies(companies)
  
  // Cache the results
  await jobScraperService.cacheJobsForUsers(jobs)
  
  const duration = (Date.now() - startTime) / 1000
  
  console.log(`\n✅ Company scrape completed in ${duration}s`)
  console.log(`📊 Jobs found: ${jobs.length}`)
  console.log(`🏢 Companies searched: ${companies.slice(0, 5).join(', ')}${companies.length > 5 ? '...' : ''}`)
  console.log('💾 Jobs cached for instant user access')
}

/**
 * Quick scrape - minimal test
 */
async function quickScrape() {
  console.log('⚡ Quick scrape test...')
  console.log('⏱️  This should take 10-20 seconds\n')
  
  const startTime = Date.now()
  
  // Test just one free source
  const jobs = await jobScraperService.scrapeRemoteOK(['Software Engineer'], ['Remote'])
  
  const duration = (Date.now() - startTime) / 1000
  
  console.log(`\n✅ Quick scrape completed in ${duration}s`)
  console.log(`📊 Jobs found from RemoteOK: ${jobs.length}`)
  
  if (jobs.length > 0) {
    console.log('🎉 Scraping system is working!')
    console.log('📋 Sample job:')
    const sample = jobs[0]
    console.log(`   Title: ${sample.title}`)
    console.log(`   Company: ${sample.company}`)
    console.log(`   Location: ${sample.location}`)
  }
}

/**
 * Show usage help
 */
function showHelp() {
  console.log('🔧 Manual Scrape Usage:')
  console.log('')
  console.log('npm run scrape:manual [mode]')
  console.log('')
  console.log('Modes:')
  console.log('  full      - Complete daily update (default)')
  console.log('  free      - Free job sources only')
  console.log('  companies - Target companies only')
  console.log('  quick     - Quick test (one source)')
  console.log('')
  console.log('Examples:')
  console.log('  npm run scrape:manual')
  console.log('  npm run scrape:manual quick')
  console.log('  npm run scrape:manual free')
  console.log('  npm run scrape:manual companies')
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp()
  process.exit(0)
}

// Run manual scrape
manualScrape()
