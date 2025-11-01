/**
 * Simple Job List - Direct database query to test what's actually there
 */

import React, { useState, useEffect } from 'react'
import { Database, Eye } from 'lucide-react'

const SimpleJobList = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAllJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { supabase } = await import('../lib/supabase')
      
      console.log('🔍 SIMPLE TEST: Loading ALL jobs from database...')
      
      // Try the simplest possible query - get everything
      const { data: allJobs, error: allError } = await supabase
        .from('scraped_jobs')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(20)
      
      console.log('📊 Simple query result:', { 
        count: allJobs?.length || 0, 
        error: allError?.message,
        jobs: allJobs
      })
      
      if (allError) {
        setError(allError.message)
        return
      }
      
      setJobs(allJobs || [])
      
    } catch (err) {
      console.error('❌ Simple test failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testCachedJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { supabase } = await import('../lib/supabase')
      
      console.log('🔍 CACHED TEST: Loading cached jobs...')
      
      // Test cached jobs query
      const { data: cachedJobs, error: cachedError } = await supabase
        .from('scraped_jobs')
        .select('*')
        .eq('is_cached', true)
        .limit(20)
      
      console.log('💾 Cached query result:', { 
        count: cachedJobs?.length || 0, 
        error: cachedError?.message,
        jobs: cachedJobs
      })
      
      if (cachedError) {
        setError(cachedError.message)
        return
      }
      
      setJobs(cachedJobs || [])
      
    } catch (err) {
      console.error('❌ Cached test failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load jobs on mount
  useEffect(() => {
    loadAllJobs()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Simple Job List Test</h2>
        <span className="text-sm text-gray-600">
          {jobs.length} jobs loaded
        </span>
      </div>

      {/* Test Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={loadAllJobs}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg"
        >
          <Database className="w-4 h-4" />
          <span>Load All Jobs</span>
        </button>

        <button
          onClick={testCachedJobs}
          disabled={loading}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg"
        >
          <Eye className="w-4 h-4" />
          <span>Load Cached Jobs</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4">
          ❌ Error: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading jobs...</p>
        </div>
      )}

      {/* Jobs List */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No jobs found in database
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Found {jobs.length} jobs:</h3>
          {jobs.map((job, index) => (
            <div key={job.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{job.title}</h4>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {job.source}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-2">
                <strong>Company:</strong> {job.company}
              </p>
              
              <p className="text-gray-600 text-sm mb-2">
                <strong>Location:</strong> {job.location}
              </p>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>User ID: {job.user_id || 'null'}</span>
                <span>Cached: {job.is_cached ? 'Yes' : 'No'}</span>
                <span>Scraped: {new Date(job.scraped_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Test Instructions:</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-1 space-y-1">
          <li>• Click "Load All Jobs" to see everything in the database</li>
          <li>• Click "Load Cached Jobs" to see only cached jobs</li>
          <li>• Check the browser console for detailed query results</li>
          <li>• Look at the "Cached: Yes/No" field for each job</li>
        </ul>
      </div>
    </div>
  )
}

export default SimpleJobList
