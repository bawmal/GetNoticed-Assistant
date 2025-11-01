/**
 * Job Scraping Controls Component
 * Provides UI buttons to trigger job scraping and view results
 */

import React, { useState, useEffect } from 'react'
import { RefreshCw, Database, BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react'

const JobScrapingControls = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [jobStats, setJobStats] = useState(null)
  const [systemHealth, setSystemHealth] = useState(null)
  const [message, setMessage] = useState('')

  // Load initial data
  useEffect(() => {
    loadSystemStatus()
  }, [])

  /**
   * Load system status and job statistics
   */
  const loadSystemStatus = async () => {
    try {
      // Get system health
      const healthResponse = await fetch('/api/jobs/optimized?action=health', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      })
      const health = await healthResponse.json()
      setSystemHealth(health)

      // Get job statistics
      const statsResponse = await fetch('/api/jobs/optimized?action=stats', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      })
      const stats = await statsResponse.json()
      setJobStats(stats)
      setLastUpdate(stats.lastUpdated)

    } catch (error) {
      console.error('Failed to load system status:', error)
      setMessage('Failed to load system status')
    }
  }

  /**
   * Trigger manual job update (clear and rescrape)
   */
  const triggerJobUpdate = async () => {
    setIsLoading(true)
    setMessage('Starting job update...')

    try {
      const response = await fetch('/api/jobs/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          action: 'trigger_daily_update'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✅ Job update completed! Processed ${result.jobsProcessed} jobs`)
        await loadSystemStatus() // Refresh stats
      } else {
        setMessage(`❌ Job update failed: ${result.error}`)
      }

    } catch (error) {
      setMessage(`❌ Job update failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Force refresh user jobs
   */
  const forceRefreshJobs = async () => {
    setIsLoading(true)
    setMessage('Refreshing your jobs...')

    try {
      const response = await fetch('/api/jobs/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          action: 'force_refresh'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✅ Jobs refreshed! Found ${result.count} jobs`)
      } else {
        setMessage(`❌ Refresh failed: ${result.error}`)
      }

    } catch (error) {
      setMessage(`❌ Refresh failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get status color based on system health
   */
  const getStatusColor = () => {
    if (!systemHealth) return 'text-gray-500'
    
    switch (systemHealth.status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  /**
   * Format last update time
   */
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Less than 1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Job Scraping System</h2>
        
        {/* System Status Indicator */}
        <div className="flex items-center space-x-2">
          {systemHealth?.status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {systemHealth?.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
          {systemHealth?.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {systemHealth?.status || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Job Statistics */}
      {jobStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Cached Jobs</p>
                <p className="text-lg font-semibold text-gray-800">{jobStats.totalCachedJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Target Companies</p>
                <p className="text-lg font-semibold text-gray-800">{jobStats.uniqueTargetCompanies}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Last Update</p>
                <p className="text-sm font-medium text-gray-800">{formatLastUpdate(lastUpdate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={triggerJobUpdate}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Updating...' : 'Clear & Rescrape All Jobs'}</span>
        </button>

        <button
          onClick={forceRefreshJobs}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Database className="w-4 h-4" />
          <span>Refresh My Jobs</span>
        </button>

        <button
          onClick={loadSystemStatus}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : message.includes('❌')
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* System Health Issues */}
      {systemHealth?.issues && systemHealth.issues.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-2">System Issues:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            {systemHealth.issues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Jobs by Source Breakdown */}
      {jobStats?.jobsBySource && Object.keys(jobStats.jobsBySource).length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Jobs by Source:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(jobStats.jobsBySource)
              .sort(([,a], [,b]) => b - a)
              .map(([source, count]) => (
                <div key={source} className="bg-gray-50 p-2 rounded text-center">
                  <p className="text-xs text-gray-600 capitalize">{source.replace('_', ' ')}</p>
                  <p className="text-sm font-semibold text-gray-800">{count}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default JobScrapingControls
