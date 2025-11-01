/**
 * Quick Test Script - Basic functionality check
 * Run this for a fast health check of the system
 */

import { checkSystemHealth, getJobStatistics } from './src/lib/optimizedJobService.js'

async function quickTest() {
  console.log('⚡ Quick System Health Check\n')
  
  try {
    // Test 1: System Health
    console.log('🏥 Checking system health...')
    const health = await checkSystemHealth()
    console.log(`   Status: ${health.status}`)
    console.log(`   Cached jobs available: ${health.cachedJobsAvailable}`)
    console.log(`   Last update: ${health.lastUpdate || 'Never'}`)
    if (health.issues.length > 0) {
      console.log(`   Issues: ${health.issues.join(', ')}`)
    }
    
    // Test 2: Job Statistics
    console.log('\n📊 Getting job statistics...')
    const stats = await getJobStatistics()
    console.log(`   Total cached jobs: ${stats.totalCachedJobs}`)
    console.log(`   Unique target companies: ${stats.uniqueTargetCompanies}`)
    console.log(`   Jobs by source:`)
    Object.entries(stats.jobsBySource).forEach(([source, count]) => {
      console.log(`     - ${source}: ${count} jobs`)
    })
    
    // Test 3: Environment Check
    console.log('\n🔧 Environment check...')
    const hasGoogleAPI = !!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log(`   Google API configured: ${hasGoogleAPI}`)
    console.log(`   Supabase configured: ${hasSupabase}`)
    
    // Summary
    console.log('\n✅ Quick test completed!')
    
    if (health.status === 'healthy' && stats.totalCachedJobs > 0) {
      console.log('🎉 System is working well!')
    } else if (health.status === 'warning') {
      console.log('⚠️  System has some issues but is functional')
    } else {
      console.log('❌ System needs attention')
    }
    
    console.log('\n📋 Next steps:')
    if (!hasGoogleAPI) {
      console.log('   - Set up Google Custom Search API for enhanced scraping')
    }
    if (stats.totalCachedJobs === 0) {
      console.log('   - Run: npm run scrape:manual to populate job cache')
    }
    console.log('   - Run: npm test for comprehensive testing')
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   - Check your .env file has correct Supabase credentials')
    console.log('   - Ensure database is accessible')
    console.log('   - Run: npm test for detailed error information')
  }
}

// Run quick test
quickTest()
