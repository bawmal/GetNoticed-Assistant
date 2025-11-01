/**
 * Debug Jobs - Check what's actually in the database
 */

async function debugJobs() {
  console.log('🔍 Debugging job database...')
  
  try {
    const { supabase } = await import('./src/lib/supabase.js')
    
    // Check all jobs in database
    console.log('\n1️⃣ Checking all jobs in database...')
    const { data: allJobs, error: allError } = await supabase
      .from('scraped_jobs')
      .select('id, user_id, is_cached, source, title, company, scraped_at')
      .order('scraped_at', { ascending: false })
      .limit(10)
    
    console.log('All jobs result:', { 
      count: allJobs?.length || 0, 
      error: allError?.message,
      sample: allJobs?.[0]
    })
    
    // Check specifically cached jobs
    console.log('\n2️⃣ Checking cached jobs...')
    const { data: cachedJobs, error: cachedError } = await supabase
      .from('scraped_jobs')
      .select('id, user_id, is_cached, source, title, company, scraped_at')
      .eq('is_cached', true)
      .order('scraped_at', { ascending: false })
      .limit(10)
    
    console.log('Cached jobs result:', { 
      count: cachedJobs?.length || 0, 
      error: cachedError?.message,
      sample: cachedJobs?.[0]
    })
    
    // Check table structure
    console.log('\n3️⃣ Checking table structure...')
    const { data: columns, error: structError } = await supabase
      .rpc('get_table_columns', { table_name: 'scraped_jobs' })
      .catch(() => {
        // Fallback: try to get one row to see structure
        return supabase
          .from('scraped_jobs')
          .select('*')
          .limit(1)
      })
    
    console.log('Table structure check:', { 
      error: structError?.message,
      hasIsCached: cachedJobs?.[0]?.hasOwnProperty('is_cached')
    })
    
    // Check RLS policies
    console.log('\n4️⃣ Testing RLS policies...')
    
    // Test if we can read cached jobs
    const { data: testRead, error: readError } = await supabase
      .from('scraped_jobs')
      .select('count')
      .eq('is_cached', true)
    
    console.log('RLS test result:', { 
      canRead: !readError,
      error: readError?.message
    })
    
    // Summary
    console.log('\n📊 SUMMARY:')
    console.log(`Total jobs in DB: ${allJobs?.length || 0}`)
    console.log(`Cached jobs: ${cachedJobs?.length || 0}`)
    console.log(`Can read cached jobs: ${!readError}`)
    
    if (cachedJobs?.length > 0) {
      console.log('\n✅ Cached jobs exist! The issue might be in the frontend.')
      console.log('Sample cached job:', cachedJobs[0])
    } else if (allJobs?.length > 0) {
      console.log('\n⚠️ Jobs exist but not marked as cached.')
      console.log('Sample job:', allJobs[0])
    } else {
      console.log('\n❌ No jobs found in database.')
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run debug
debugJobs()
