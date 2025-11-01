/**
 * Test Script for Enhanced Multi-Method Job Scraping System
 * Run this to test all components of the scalable architecture
 */

import { jobScraperService } from './src/lib/jobScraper.js'
import { getJobsForUser, getJobStatistics, checkSystemHealth } from './src/lib/optimizedJobService.js'
import { triggerManualJobUpdate } from './src/lib/cronJobs.js'

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 Starting comprehensive job scraping system tests...\n')
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }
  
  // Test 1: System Health Check
  await runTest('System Health Check', testSystemHealth, results)
  
  // Test 2: Google API Configuration
  await runTest('Google API Configuration', testGoogleAPIConfig, results)
  
  // Test 3: Database Connection
  await runTest('Database Connection', testDatabaseConnection, results)
  
  // Test 4: Basic Job Scraping (Free Sources)
  await runTest('Free Sources Scraping', testFreeSourcesScraping, results)
  
  // Test 5: Target Company Research
  await runTest('Target Company Research', testTargetCompanyResearch, results)
  
  // Test 6: Multi-Method Search (if Google API configured)
  await runTest('Multi-Method Search', testMultiMethodSearch, results)
  
  // Test 7: Job Caching System
  await runTest('Job Caching System', testJobCaching, results)
  
  // Test 8: User Job Retrieval
  await runTest('User Job Retrieval', testUserJobRetrieval, results)
  
  // Test 9: Daily Batch Processing
  await runTest('Daily Batch Processing', testDailyBatchProcessing, results)
  
  // Print Results
  printTestResults(results)
}

/**
 * Test runner helper
 */
async function runTest(testName, testFunction, results) {
  console.log(`🔍 Testing: ${testName}`)
  
  try {
    const result = await testFunction()
    
    if (result.success) {
      console.log(`✅ ${testName}: PASSED`)
      if (result.message) console.log(`   ${result.message}`)
      results.passed++
    } else {
      console.log(`❌ ${testName}: FAILED`)
      console.log(`   Error: ${result.error}`)
      results.failed++
    }
    
    results.tests.push({ name: testName, ...result })
    
  } catch (error) {
    console.log(`❌ ${testName}: ERROR`)
    console.log(`   Exception: ${error.message}`)
    results.failed++
    results.tests.push({ name: testName, success: false, error: error.message })
  }
  
  console.log('') // Empty line for readability
}

/**
 * Test 1: System Health Check
 */
async function testSystemHealth() {
  try {
    const health = await checkSystemHealth()
    
    return {
      success: true,
      message: `Status: ${health.status}, Cached jobs: ${health.cachedJobsAvailable}`,
      data: health
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Test 2: Google API Configuration
 */
async function testGoogleAPIConfig() {
  try {
    const hasApiKey = !!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
    const hasSearchEngineId = !!process.env.GOOGLE_SEARCH_ENGINE_ID
    
    if (!hasApiKey || !hasSearchEngineId) {
      return {
        success: false,
        error: `Missing Google API credentials. API Key: ${hasApiKey}, Search Engine ID: ${hasSearchEngineId}`
      }
    }
    
    // Test a simple search
    const testQuery = 'site:boards.greenhouse.io "test"'
    const searchResults = await jobScraperService.executeGoogleSiteSearch(testQuery)
    
    return {
      success: true,
      message: `Google API working. Search returned ${searchResults.searchInformation?.totalResults || 0} results`,
      data: { totalResults: searchResults.searchInformation?.totalResults }
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Google API test failed: ${error.message}` 
    }
  }
}

/**
 * Test 3: Database Connection
 */
async function testDatabaseConnection() {
  try {
    const { supabase } = await import('./src/lib/supabase.js')
    
    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('job_scraping_preferences')
      .select('count(*)')
      .limit(1)
    
    if (error) throw error
    
    return {
      success: true,
      message: 'Database connection successful',
      data: { connected: true }
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Database connection failed: ${error.message}` 
    }
  }
}

/**
 * Test 4: Free Sources Scraping
 */
async function testFreeSourcesScraping() {
  try {
    console.log('   Testing free job sources (this may take 30-60 seconds)...')
    
    // Test a few free sources with timeout
    const timeout = 30000 // 30 seconds
    const testPromise = jobScraperService.scrapeAllFreeSources()
    
    const jobs = await Promise.race([
      testPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 30 seconds')), timeout)
      )
    ])
    
    return {
      success: true,
      message: `Free sources returned ${jobs.length} jobs`,
      data: { jobCount: jobs.length }
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Free sources test failed: ${error.message}` 
    }
  }
}

/**
 * Test 5: Target Company Research
 */
async function testTargetCompanyResearch() {
  try {
    const companies = await jobScraperService.getAllUniqueTargetCompanies()
    
    return {
      success: true,
      message: `Found ${companies.length} unique target companies across all users`,
      data: { companies: companies.slice(0, 5) } // Show first 5
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Target company research failed: ${error.message}` 
    }
  }
}

/**
 * Test 6: Multi-Method Search
 */
async function testMultiMethodSearch() {
  try {
    // Only test if Google API is configured
    if (!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY) {
      return {
        success: true,
        message: 'Skipped - Google API not configured (this is optional for testing)'
      }
    }
    
    console.log('   Testing multi-method search for "JP Morgan Chase" (this may take 60 seconds)...')
    
    // Test multi-method search for one company
    const testCompanies = ['JP Morgan Chase']
    const jobs = await jobScraperService.batchGoogleSearchTargetCompanies(testCompanies)
    
    return {
      success: true,
      message: `Multi-method search found ${jobs.length} jobs for JP Morgan Chase`,
      data: { jobCount: jobs.length, sources: [...new Set(jobs.map(j => j.source))] }
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Multi-method search failed: ${error.message}` 
    }
  }
}

/**
 * Test 7: Job Caching System
 */
async function testJobCaching() {
  try {
    // Create test jobs
    const testJobs = [
      {
        source: 'test',
        external_id: `test_${Date.now()}`,
        title: 'Test Job',
        company: 'Test Company',
        location: 'Remote',
        description: 'Test job description',
        url: 'https://test.com/job',
        posted_date: new Date().toISOString(),
        salary_range: '$100,000-150,000',
        employment_type: 'Full-time',
        scraped_at: new Date().toISOString()
      }
    ]
    
    // Test caching
    await jobScraperService.cacheJobsForUsers(testJobs)
    
    // Test retrieval
    const cachedJobs = await jobScraperService.getCachedJobs()
    
    return {
      success: true,
      message: `Caching system working. ${cachedJobs.length} cached jobs available`,
      data: { cachedJobCount: cachedJobs.length }
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Job caching test failed: ${error.message}` 
    }
  }
}

/**
 * Test 8: User Job Retrieval
 */
async function testUserJobRetrieval() {
  try {
    // Test with a mock user ID
    const testUserId = 'test-user-123'
    
    // This should use cached jobs if available
    const jobs = await getJobsForUser(testUserId)
    
    return {
      success: true,
      message: `User job retrieval returned ${jobs.length} jobs`,
      data: { jobCount: jobs.length }
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `User job retrieval failed: ${error.message}` 
    }
  }
}

/**
 * Test 9: Daily Batch Processing
 */
async function testDailyBatchProcessing() {
  try {
    console.log('   Testing daily batch processing (this may take 2-3 minutes)...')
    
    // Run a smaller version of the daily update for testing
    const timeout = 180000 // 3 minutes
    const testPromise = triggerManualJobUpdate()
    
    const jobs = await Promise.race([
      testPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 3 minutes')), timeout)
      )
    ])
    
    return {
      success: true,
      message: `Daily batch processing completed. Processed ${jobs.length} jobs`,
      data: { jobCount: jobs.length }
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Daily batch processing failed: ${error.message}` 
    }
  }
}

/**
 * Print test results summary
 */
function printTestResults(results) {
  console.log('=' .repeat(60))
  console.log('🧪 TEST RESULTS SUMMARY')
  console.log('=' .repeat(60))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📊 Total: ${results.tests.length}`)
  console.log('')
  
  if (results.failed > 0) {
    console.log('❌ FAILED TESTS:')
    results.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`)
      })
    console.log('')
  }
  
  console.log('📋 RECOMMENDATIONS:')
  
  if (results.failed === 0) {
    console.log('🎉 All tests passed! Your job scraping system is ready for production.')
  } else {
    console.log('🔧 Fix the failed tests above before deploying to production.')
    
    // Specific recommendations
    const failedTests = results.tests.filter(test => !test.success)
    
    if (failedTests.some(test => test.name.includes('Google API'))) {
      console.log('   - Set up Google Custom Search API credentials (optional but recommended)')
    }
    
    if (failedTests.some(test => test.name.includes('Database'))) {
      console.log('   - Check Supabase connection and credentials')
    }
    
    if (failedTests.some(test => test.name.includes('Free Sources'))) {
      console.log('   - Check internet connection and job board availability')
    }
  }
  
  console.log('')
  console.log('🚀 Next steps:')
  console.log('   1. Fix any failed tests')
  console.log('   2. Set up Google API for enhanced scraping (optional)')
  console.log('   3. Initialize the cron job system: npm run start:cron')
  console.log('   4. Deploy to production')
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => {
      console.log('🏁 Testing complete!')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Testing failed:', error)
      process.exit(1)
    })
}

export { runAllTests }
