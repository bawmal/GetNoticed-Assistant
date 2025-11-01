/**
 * Test Direct Database Access - Bypass RLS
 * Run this to see what's actually in the database
 */

async function testDirectDB() {
  console.log('🔍 Testing direct database access...')
  
  try {
    // Use service role key to bypass RLS
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing Supabase credentials')
      console.log('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
      return
    }
    
    // Create admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    console.log('🔑 Using service role key to bypass RLS...')
    
    // Test 1: Check table exists and get count
    console.log('\n1️⃣ Checking table...')
    const { data: countData, error: countError } = await supabaseAdmin
      .from('scraped_jobs')
      .select('*', { count: 'exact', head: true })
    
    console.log('Table check:', { 
      error: countError?.message,
      count: countData?.length 
    })
    
    // Test 2: Get actual jobs
    console.log('\n2️⃣ Getting jobs...')
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from('scraped_jobs')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(10)
    
    console.log('Jobs result:', { 
      count: jobs?.length || 0,
      error: jobsError?.message,
      sample: jobs?.[0]
    })
    
    // Test 3: Check table structure
    if (jobs && jobs.length > 0) {
      console.log('\n3️⃣ Table structure:')
      console.log('Columns:', Object.keys(jobs[0]))
      
      console.log('\n4️⃣ Job details:')
      jobs.slice(0, 3).forEach((job, i) => {
        console.log(`Job ${i + 1}:`, {
          id: job.id,
          title: job.title,
          company: job.company,
          source: job.source,
          user_id: job.user_id,
          is_cached: job.is_cached,
          scraped_at: job.scraped_at
        })
      })
    }
    
    // Test 4: Try to fix jobs if they exist
    if (jobs && jobs.length > 0) {
      console.log('\n5️⃣ Fixing jobs to be cached...')
      
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('scraped_jobs')
        .update({ is_cached: true })
        .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .select('id')
      
      console.log('Update result:', {
        updated: updateData?.length || 0,
        error: updateError?.message
      })
    }
    
  } catch (error) {
    console.error('❌ Direct DB test failed:', error)
  }
}

// Run test
testDirectDB()
