// Quick test script for job scraper
// Run this in browser console or as a standalone test

import { jobScraperService } from './jobScraper'
import { supabase } from './supabase'

export async function testJobScraper() {
  console.log('🔍 Starting job scraper test...')
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('❌ No user logged in')
      return
    }
    
    console.log('✅ User authenticated:', user.email)
    
    // Test configuration
    const userProfile = {
      user_id: user.id,
      target_companies: []
    }
    
    const keywords = ['Product Manager', 'Software Engineer', 'Designer']
    const locations = ['Remote', 'San Francisco', 'New York']
    
    console.log('📋 Search criteria:')
    console.log('  Keywords:', keywords)
    console.log('  Locations:', locations)
    
    // Run scraper
    console.log('\n🚀 Running scraper...')
    const startTime = Date.now()
    
    const jobs = await jobScraperService.scrapeJobs(
      userProfile,
      keywords,
      locations
    )
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    
    console.log(`\n✅ Scraping complete in ${duration}s`)
    console.log(`📊 Results:`)
    console.log(`  Total jobs found: ${jobs.length}`)
    
    // Group by source
    const bySource = jobs.reduce((acc, job) => {
      acc[job.source] = (acc[job.source] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📈 Jobs by source:')
    Object.entries(bySource).forEach(([source, count]) => {
      console.log(`  ${source}: ${count}`)
    })
    
    // Show sample jobs
    console.log('\n📝 Sample jobs:')
    jobs.slice(0, 5).forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.title}`)
      console.log(`   Company: ${job.company}`)
      console.log(`   Location: ${job.location}`)
      console.log(`   Source: ${job.source}`)
      console.log(`   Fit Score: ${job.fit_score || 'pending'}%`)
    })
    
    // Check database
    console.log('\n💾 Checking database...')
    const { data: dbJobs, error } = await supabase
      .from('scraped_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('scraped_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Database error:', error)
    } else {
      console.log(`✅ Database has ${dbJobs.length} jobs for this user`)
    }
    
    return {
      success: true,
      totalJobs: jobs.length,
      bySource,
      duration,
      sampleJobs: jobs.slice(0, 5)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  window.testJobScraper = testJobScraper
  console.log('💡 Run testJobScraper() to test the job scraper')
}
