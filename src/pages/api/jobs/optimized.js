/**
 * Optimized Jobs API Endpoint
 * Uses cached jobs for instant responses (scalable architecture)
 */

import { getJobsForUser, getJobStatistics, checkSystemHealth } from '../../../lib/optimizedJobService.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { method } = req
    
    if (method === 'GET') {
      return await handleGetJobs(req, res)
    }
    
    if (method === 'POST') {
      return await handleJobActions(req, res)
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

/**
 * Handle GET requests for jobs
 */
async function handleGetJobs(req, res) {
  try {
    const { action, user_id } = req.query
    
    // Get user from auth header
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    const userId = user_id || user.id
    
    if (action === 'stats') {
      // Admin endpoint for statistics
      const stats = await getJobStatistics()
      return res.status(200).json(stats)
    }
    
    if (action === 'health') {
      // System health check
      const health = await checkSystemHealth()
      return res.status(200).json(health)
    }
    
    // Default: Get jobs for user (optimized)
    console.log(`📡 API: Getting optimized jobs for user ${userId}`)
    const startTime = Date.now()
    
    const jobs = await getJobsForUser(userId)
    
    const responseTime = Date.now() - startTime
    console.log(`✅ API: Returned ${jobs.length} jobs in ${responseTime}ms`)
    
    return res.status(200).json({
      jobs,
      count: jobs.length,
      responseTime: `${responseTime}ms`,
      cached: true,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting jobs:', error)
    return res.status(500).json({ 
      error: 'Failed to get jobs',
      message: error.message 
    })
  }
}

/**
 * Handle POST requests for job actions
 */
async function handleJobActions(req, res) {
  try {
    const { action } = req.body
    
    // Get user from auth header
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    if (action === 'force_refresh') {
      // Force refresh jobs for user (emergency use)
      console.log(`🔄 API: Force refresh requested for user ${user.id}`)
      
      const { forceRefreshUserJobs } = await import('../../../lib/optimizedJobService.js')
      const jobs = await forceRefreshUserJobs(user.id)
      
      return res.status(200).json({
        message: 'Jobs refreshed successfully',
        jobs,
        count: jobs.length,
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'trigger_daily_update') {
      // Admin action to trigger daily update manually
      console.log(`🔧 API: Manual daily update triggered by user ${user.id}`)
      
      const { triggerManualJobUpdate } = await import('../../../lib/cronJobs.js')
      const jobs = await triggerManualJobUpdate()
      
      return res.status(200).json({
        message: 'Daily job update triggered successfully',
        jobsProcessed: jobs.length,
        timestamp: new Date().toISOString()
      })
    }
    
    return res.status(400).json({ error: 'Invalid action' })
    
  } catch (error) {
    console.error('Error handling job action:', error)
    return res.status(500).json({ 
      error: 'Failed to handle job action',
      message: error.message 
    })
  }
}
