/**
 * Clear Job Cache - Remove all cached jobs from database
 */

async function clearCache() {
  console.log('🧹 Clearing job cache...')
  
  try {
    const { supabase } = await import('./src/lib/supabase.js')
    
    // Delete all cached jobs (user_id = 'CACHED')
    const { data, error } = await supabase
      .from('scraped_jobs')
      .delete()
      .eq('user_id', 'CACHED')
    
    if (error) throw error
    
    console.log('✅ Job cache cleared successfully!')
    console.log('💡 Run "npm test" to populate with fresh jobs')
    
  } catch (error) {
    console.error('❌ Failed to clear cache:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   - Check Supabase credentials in .env file')
    console.log('   - Ensure database connection is working')
  }
}

clearCache()
