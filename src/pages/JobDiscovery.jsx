import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Briefcase, MapPin, Clock, DollarSign, TrendingUp, ExternalLink, Bookmark, X, Star, Send, FileText, Search, SlidersHorizontal, ChevronDown, ChevronUp, CheckSquare, Square, GitCompare, Info, Building2, ArrowUp, ArrowDown, Sparkles, Zap, Target, Filter as FilterIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import SimpleJobControls from '../components/SimpleJobControls'
import { calculateCVMatch, getMatchQuality } from '../lib/cvMatcher'
import { geminiService } from '../lib/gemini'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { Document as PDFDocument, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  text: {
    marginBottom: 8,
  },
})

// Helper function to convert plain text to PDF
const convertTextToPdf = async (text, filename) => {
  try {
    console.log('📄 Converting to PDF:', filename)
    const lines = text.split('\n')
    
    const PDFDoc = (
      <PDFDocument>
        <Page size="A4" style={pdfStyles.page}>
          <View>
            {lines.map((line, index) => (
              <Text key={index} style={pdfStyles.text}>
                {line || ' '}
              </Text>
            ))}
          </View>
        </Page>
      </PDFDocument>
    )
    
    const blob = await pdf(PDFDoc).toBlob()
    console.log('✅ PDF blob created:', blob.size, 'bytes')
    saveAs(blob, filename)
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    alert('Failed to generate PDF: ' + error.message)
  }
}

// Helper function to convert plain text to DOCX
const convertTextToDocx = async (text, filename) => {
  try {
    console.log('📝 Converting to DOCX:', filename)
    const paragraphs = text.split('\n').map(line => 
      new Paragraph({
        children: [new TextRun(line)],
        spacing: { after: 100 }
      })
    )
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })
    
    const blob = await Packer.toBlob(doc)
    console.log('✅ DOCX blob created:', blob.size, 'bytes')
    saveAs(blob, filename)
  } catch (error) {
    console.error('❌ DOCX generation error:', error)
    alert('Failed to generate DOCX: ' + error.message)
  }
}

export default function JobDiscovery() {
  const [jobs, setJobs] = useState([])
  const [allJobs, setAllJobs] = useState([]) // Store all jobs for filtering
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'new', 'high-fit'
  const [quickApplyModal, setQuickApplyModal] = useState(null)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null) // User's primary CV profile
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    customMessage: '',
    resumeVersion: 'default'
  })
  
  // New state for enhancements
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [salaryFilter, setSalaryFilter] = useState({ min: '', max: '' })
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('')
  const [sortBy, setSortBy] = useState('date') // 'date', 'fit', 'salary', 'company'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [selectedJobs, setSelectedJobs] = useState(new Set())
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonJobs, setComparisonJobs] = useState([])
  const [appliedJobIds, setAppliedJobIds] = useState(new Set())
  const [showFitScoreModal, setShowFitScoreModal] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [isInitialScraping, setIsInitialScraping] = useState(false)
  const observerTarget = useRef(null)
  
  // Auto-apply state
  const [autoApplyModal, setAutoApplyModal] = useState(null)
  const [autoApplyLoading, setAutoApplyLoading] = useState(false)
  const [autoApplyStatus, setAutoApplyStatus] = useState(null)
  const [showAutoApplySettings, setShowAutoApplySettings] = useState(false)
  const [autoApplySettings, setAutoApplySettings] = useState({
    enabled: false,
    minMatchScore: 70,
    maxApplicationsPerDay: 5,
    autoGenerate: true
  })

  // Load user and applied jobs on component mount
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load applied job IDs
        const { data: applications } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('user_id', user.id)
        
        if (applications) {
          setAppliedJobIds(new Set(applications.map(app => app.job_id)))
        }
        
        // Load user's primary CV profile for CV-based matching
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single()
        
        if (profile) {
          setUserProfile(profile)
          console.log('✅ Loaded primary CV profile for matching')
        } else {
          console.log('⚠️ No primary CV profile found - prompting user to upload')
        }
      }
    }
    loadUser()
  }, [])

  // Helper function to strip HTML tags and decode entities
  const stripHtml = (html) => {
    if (!html) return ''
    
    try {
      // First decode HTML entities like &lt; &gt; &amp;
      let decoded = html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
      
      // Create a temporary div to strip HTML tags
      const tmp = document.createElement('div')
      tmp.innerHTML = decoded
      
      // Get clean text
      const text = tmp.textContent || tmp.innerText || ''
      
      // Clean up extra whitespace and limit length
      const cleaned = text.replace(/\s+/g, ' ').trim()
      return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned
      
    } catch (error) {
      // Fallback: simple regex strip
      return html
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200) + '...'
    }
  }

  // Helper function to format posted date
  const formatPostedDate = (dateString, source) => {
    if (!dateString) return 'Recently found'
    
    try {
      const posted = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - posted)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let timeText = ''
      if (diffDays === 1) timeText = '1 day ago'
      else if (diffDays < 7) timeText = `${diffDays} days ago`
      else if (diffDays < 30) timeText = `${Math.ceil(diffDays / 7)} weeks ago`
      else timeText = posted.toLocaleDateString()
      
      // Add source context for clarity
      const sourceText = source ? ` on ${source}` : ''
      return `Found ${timeText}${sourceText}`
    } catch (error) {
      return 'Recently found'
    }
  }

  // Quick Apply functions
  const openQuickApplyModal = (job) => {
    setQuickApplyModal(job)
    setApplicationData({
      coverLetter: generateCoverLetter(job),
      customMessage: '',
      resumeVersion: 'default'
    })
  }

  const generateCoverLetter = (job) => {
    return `Dear ${job.company} Hiring Team,

I am excited to apply for the ${job.title} position. With my background in product management and passion for building user-centric solutions, I believe I would be a great fit for your team.

I am particularly drawn to ${job.company} because of your innovative approach and commitment to excellence. I would love to contribute to your mission and help drive product success.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
[Your Name]`
  }

  const submitQuickApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Save application to database
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_id: quickApplyModal.id,
          company: quickApplyModal.company,
          position: quickApplyModal.title,
          application_url: quickApplyModal.url,
          cover_letter: applicationData.coverLetter,
          custom_message: applicationData.customMessage,
          resume_version: applicationData.resumeVersion,
          status: 'applied',
          applied_at: new Date().toISOString()
        })

      if (error) throw error
      
      // Update applied jobs set
      setAppliedJobIds(new Set([...appliedJobIds, quickApplyModal.id]))

      alert('✅ Application saved! You can now apply through the company website.')
      setQuickApplyModal(null)
      
      // Open job URL in new tab
      window.open(quickApplyModal.url, '_blank')
      
    } catch (error) {
      console.error('Error saving application:', error)
      alert('❌ Error saving application')
    }
  }

  useEffect(() => {
    loadJobs()
  }, [user])
  
  // Auto-refresh jobs every 6 hours (checks cache first, so very cheap)
  useEffect(() => {
    // Set up interval to refresh jobs every 6 hours
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refresh: Checking for new jobs...')
      loadJobs()
    }, 6 * 60 * 60 * 1000) // 6 hours in milliseconds
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval)
  }, [user])
  
  // Create search index for better performance (memoized)
  const searchIndex = useMemo(() => {
    return allJobs.map(job => ({
      id: job.id,
      searchText: `${job.title || ''} ${job.company || ''} ${job.description || ''} ${job.location || ''}`.toLowerCase()
    }))
  }, [allJobs])
  
  // Apply filters, search, and sorting when jobs or filters change
  useEffect(() => {
    applyFiltersAndSort()
  }, [allJobs, filter, searchQuery, salaryFilter, employmentTypeFilter, companyFilter, sortBy, sortOrder])
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery, salaryFilter, employmentTypeFilter, companyFilter])
  
  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      setSelectedJobs(new Set())
      setComparisonJobs([])
      setJobs([])
      setAllJobs([])
    }
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Loading jobs with filter:', filter)
      
      // Load user preferences first
      console.log('👤 Loading preferences for user:', user?.id)
      
      const { data: prefsData, error: prefsError } = await supabase
        .from('job_scraping_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single()
      
      if (prefsError) {
        console.warn('⚠️ No preferences found:', prefsError.message)
      }
      
      const userPreferences = prefsData || {}
      
      // Use countries for location filtering (simpler and more accurate)
      userPreferences.locations = userPreferences.countries || []
      
      console.log('👤 User preferences loaded:', {
        keywords: userPreferences.keywords,
        countries: userPreferences.countries,
        hasPreferences: !!prefsData
      })
      
      // Load cached jobs from enhanced scraping system
      let query = supabase
        .from('scraped_jobs')
        .select('*')
        .eq('is_cached', true) // Get cached jobs from enhanced scraping
        .order('scraped_at', { ascending: false })
      
      const { data: cachedJobs, error } = await query
      
      console.log('📊 Raw query result:', { 
        cachedJobsCount: cachedJobs?.length || 0, 
        error: error?.message,
        sampleJobs: cachedJobs?.slice(0, 3)?.map(j => ({ title: j.title, source: j.source, scraped_at: j.scraped_at }))
      })
      
      // Check job freshness
      if (cachedJobs && cachedJobs.length > 0) {
        const sortedByDate = [...cachedJobs].sort((a, b) => 
          new Date(b.scraped_at) - new Date(a.scraped_at)
        )
        const mostRecent = sortedByDate[0]
        const oldest = sortedByDate[sortedByDate.length - 1]
        
        const mostRecentAge = Math.floor((Date.now() - new Date(mostRecent.scraped_at)) / (1000 * 60 * 60 * 24))
        const oldestAge = Math.floor((Date.now() - new Date(oldest.scraped_at)) / (1000 * 60 * 60 * 24))
        
        console.log('📅 Job Freshness Check:')
        console.log(`  Most recent: "${mostRecent.title}" - scraped ${mostRecentAge} days ago (${mostRecent.scraped_at})`)
        console.log(`  Oldest: "${oldest.title}" - scraped ${oldestAge} days ago (${oldest.scraped_at})`)
        
        if (mostRecentAge > 1) {
          console.warn(`⚠️ Jobs are ${mostRecentAge} days old! Consider running a fresh scraping job.`)
        }
      }
      
      // CRITICAL: Track the complete filtering pipeline
      console.log('🔄 FILTERING PIPELINE START:')
      console.log('  📥 Raw jobs from database:', cachedJobs?.length || 0)
      console.log('  🎯 User preferences:', {
        keywords: userPreferences.keywords,
        locations: userPreferences.locations,
        hasValidUser: !!user?.id
      })
      
      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }
      
      let jobsToShow = cachedJobs || []
      
      // Filter by user preferences (keywords and locations)
      console.log('🔧 User preferences:', { 
        keywords: userPreferences.keywords, 
        locations: userPreferences.locations,
        countries: userPreferences.countries 
      })
      
      if (userPreferences.keywords && userPreferences.keywords.length > 0) {
        console.log('🔍 Filtering by keywords:', userPreferences.keywords)
        const beforeCount = jobsToShow.length
        
        jobsToShow = jobsToShow.filter(job => {
          const title = job.title?.toLowerCase() || ''
          const description = job.description?.toLowerCase() || ''
          
          // Check if title matches keywords
          const titleMatches = userPreferences.keywords.some(keyword => {
            const kw = keyword.toLowerCase()
            
            // For multi-word keywords (e.g., "Product Manager"), require exact phrase match
            if (kw.includes(' ')) {
              return title.includes(kw)
            }
            
            // For single-word keywords, use word boundary matching
            const regex = new RegExp(`\\b${kw}\\b`, 'i')
            return regex.test(title)
          })
          
          // If title matches, include it
          if (titleMatches) {
            return true
          }
          
          // Otherwise, check description (but be more strict)
          const descriptionMatches = userPreferences.keywords.some(keyword => {
            const kw = keyword.toLowerCase()
            // Only match if keyword appears multiple times or in a strong context
            const count = (description.match(new RegExp(kw, 'g')) || []).length
            return count >= 2
          })
          
          const matches = titleMatches || descriptionMatches
          
          if (!matches && jobsToShow.indexOf(job) < 3) {
            console.log(`❌ Filtered out: "${job.title}" - doesn't match keywords`)
          }
          
          return matches
        })
        
        console.log(`🔍 After keyword filter: ${beforeCount} → ${jobsToShow.length} jobs`)
      } else {
        console.log('⚠️ No keywords set - showing all jobs')
      }
      
      if (userPreferences.locations && userPreferences.locations.length > 0) {
        console.log('📍 Filtering by locations:', userPreferences.locations)
        console.log('📍 Sample job locations before filter:', jobsToShow.slice(0, 5).map(j => j.location))
        const beforeCount = jobsToShow.length
        
        jobsToShow = jobsToShow.filter(job => {
          const location = job.location?.toLowerCase() || ''
          
          // Check if job location matches any user preference (STRICT matching)
          const matches = userPreferences.locations.some(userLoc => {
            const loc = userLoc.toLowerCase()
            
            // Handle "Remote" preference
            if (loc === 'remote') {
              return location.includes('remote')
            }
            
            // STRICT country matching to avoid false positives
            // USA / United States
            if (loc === 'usa' || loc === 'united states') {
              // Must contain full country name, not just state codes
              return location.includes('united states') || 
                     location.includes('usa') ||
                     // Match US states only if they're clearly in USA context
                     (location.match(/\b(usa|united states)\b/i))
            }
            
            // Canada - Include Canadian cities, provinces, AND Remote jobs
            if (loc === 'canada') {
              console.log(`🔍 Canada filter checking: "${job.title}" at "${location}"`)
              
              // Remote jobs should match ANY location preference
              if (location.includes('remote') || location.includes('worldwide')) {
                console.log(`✅ Remote job INCLUDED for Canada: "${job.title}" at "${location}"`)
                return true
              }
              
              console.log(`⚠️ Not remote, checking Canadian locations...`)
              
              // Match Canada or major Canadian cities/provinces
              const canadianLocations = /\b(canada|toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg|quebec|halifax|ontario|british columbia|alberta|manitoba|saskatchewan|nova scotia|new brunswick|newfoundland|prince edward island|on|bc|ab|qc)\b/i
              const matches = canadianLocations.test(location)
              if (matches) {
                console.log(`✅ Canadian job INCLUDED: "${job.title}" at "${location}"`)
              }
              return matches
            }
            
            // UK / United Kingdom
            if (loc === 'uk' || loc === 'united kingdom') {
              return location.match(/\b(uk|united kingdom|england|scotland|wales)\b/i) !== null
            }
            
            // Australia
            if (loc === 'australia') {
              return location.match(/\baustralia\b/i) !== null
            }
            
            // Germany
            if (loc === 'germany') {
              return location.match(/\bgermany\b/i) !== null
            }
            
            // France
            if (loc === 'france') {
              return location.match(/\bfrance\b/i) !== null
            }
            
            // Netherlands
            if (loc === 'netherlands') {
              return location.match(/\bnetherlands\b/i) !== null
            }
            
            // For any other country, use strict word boundary matching
            return location.match(new RegExp(`\\b${loc}\\b`, 'i')) !== null
          })
          
          if (!matches && beforeCount - jobsToShow.length < 5) {
            console.log(`❌ Location filtered out: "${job.title}" at "${job.location}"`)
          }
          
          return matches
        })
        
        console.log(`📍 After location filter: ${beforeCount} → ${jobsToShow.length} jobs`)
        console.log('📍 Sample jobs that passed location filter:', jobsToShow.slice(0, 5).map(j => ({ title: j.title, location: j.location })))
      } else {
        console.log('⚠️ No locations set - showing jobs from all locations')
      }
      
      console.log(`📊 Jobs after preference filtering: ${jobsToShow.length}`)
      console.log('📋 Job sources:', [...new Set(jobsToShow.map(j => j.source))])
      console.log('📋 Sample job titles:', jobsToShow.slice(0, 5).map(j => j.title))
      console.log('📋 Sample job locations:', jobsToShow.slice(0, 5).map(j => j.location))
      
      // FINAL PIPELINE SUMMARY
      console.log('🏁 FILTERING PIPELINE COMPLETE:')
      console.log(`  📥 Started with: ${cachedJobs?.length || 0} jobs`)
      console.log(`  🎯 Final result: ${jobsToShow.length} jobs`)
      console.log(`  📉 Filter efficiency: ${((jobsToShow.length / (cachedJobs?.length || 1)) * 100).toFixed(1)}%`)
      
      if (jobsToShow.length === 0) {
        console.error('🚨 ZERO JOBS AFTER FILTERING - DEBUGGING INFO:')
        console.error('  User ID:', user?.id)
        console.error('  Keywords:', userPreferences.keywords)
        console.error('  Locations:', userPreferences.locations)
        console.error('  Raw job count:', cachedJobs?.length)
      }
      
      // Calculate fit scores for all jobs (only once during load)
      jobsToShow = jobsToShow.map((job, index) => {
        // Use CV-based matching if user has uploaded CV, otherwise use keyword matching
        let fitScore, fitBreakdown
        
        if (userProfile && userProfile.master_experience) {
          // CV-based matching (more accurate)
          const cvMatch = calculateCVMatch(userProfile, job)
          fitScore = cvMatch.total
          fitBreakdown = cvMatch
          
          // Log detailed breakdown for first 3 jobs and any low-scoring PM roles
          const isPMRole = job.title?.toLowerCase().includes('product manager')
          const isLowScore = fitScore < 50
          
          if (index < 3 || (isPMRole && isLowScore)) {
            console.log(`\n🎯 CV MATCH BREAKDOWN: "${job.title}" at ${job.company}`)
            console.log(`   Total Score: ${fitScore}%`)
            console.log(`   Skills Match: ${cvMatch.skillsMatch}/30`)
            console.log(`   Experience Match: ${cvMatch.experienceMatch}/35`)
            console.log(`   Title Match: ${cvMatch.titleMatch}/20`)
            console.log(`   Domain Match: ${cvMatch.domainMatch}/15`)
            console.log(`   Description Match: ${cvMatch.descriptionMatch}/10`)
            if (cvMatch.matchedSkills?.length > 0) {
              console.log(`   ✅ Matched Skills: ${cvMatch.matchedSkills.slice(0, 5).join(', ')}`)
            }
            if (cvMatch.missingSkills?.length > 0) {
              console.log(`   ❌ Missing Skills: ${cvMatch.missingSkills.slice(0, 5).map(s => s.skill || s).join(', ')}`)
            }
          }
        } else {
          // Fallback to keyword-based matching
          const keywordMatch = calculateFitBreakdown(job, userPreferences)
          fitScore = keywordMatch.total
          fitBreakdown = keywordMatch
        }
        
        return {
          ...job,
          fit_score: fitScore,
          fit_breakdown: fitBreakdown,
          is_new: (Date.now() - new Date(job.scraped_at)) < 24 * 60 * 60 * 1000, // Mark new jobs
          match_quality: getMatchQuality(fitScore) // Add match quality label
        }
      })
      
      // Set all jobs (UI filters will be applied in applyFiltersAndSort)
      console.log(`📦 Setting allJobs to ${jobsToShow.length} jobs`)
      setAllJobs(jobsToShow)
      setLastRefresh(new Date())
      
      // If no jobs found, automatically trigger initial scraping (only once)
      if (jobsToShow.length === 0 && user && !isInitialScraping) {
        console.log('🚀 No cached jobs found - triggering initial scrape...')
        triggerInitialScrape()
      }
      
    } catch (error) {
      console.error('❌ Error loading jobs:', error)
      setJobs([]) // Set empty array to show "no jobs" message
    } finally {
      setLoading(false)
    }
  }
  
  // Auto-apply to a single job
  const handleAutoApply = async (job) => {
    if (!user || !userProfile) {
      alert('Please upload your CV first to use auto-apply')
      return
    }
    
    setAutoApplyModal(job)
    setAutoApplyLoading(true)
    setAutoApplyStatus({ type: 'loading', message: 'Analyzing job and generating documents...' })
    
    try {
      // Step 1: Scrape job details if URL exists
      let jobDetails = {
        job_title: job.title,
        company_name: job.company,
        job_description: job.description || ''
      }
      
      if (job.url) {
        try {
          setAutoApplyStatus({ type: 'loading', message: 'Fetching job details...' })
          jobDetails = await geminiService.scrapeAndExtractJob(job.url)
        } catch (error) {
          console.warn('Could not scrape job URL, using cached data:', error)
        }
      }
      
      // Step 2: Analyze job fit
      setAutoApplyStatus({ type: 'loading', message: 'Analyzing your fit for this role...' })
      const parsedProfile = JSON.parse(userProfile.master_experience)
      const analysis = await geminiService.analyzeJobFit(
        jobDetails.job_description,
        parsedProfile
      )
      
      // Step 3: Generate application materials
      setAutoApplyStatus({ type: 'loading', message: 'Generating tailored CV and cover letter...' })
      
      console.log('📝 Generating tailored CV...')
      const tailoredCV = await geminiService.generateTailoredResume(
        jobDetails.job_description,
        parsedProfile,
        analysis
      )
      
      console.log('✉️ Generating cover letter...')
      const coverLetter = await geminiService.generateCoverLetter(
        jobDetails.job_description,
        jobDetails.company_name,
        parsedProfile,
        analysis
      )
      
      const documents = {
        tailoredCV,
        coverLetter
      }
      
      console.log('✅ Documents generated successfully')
      
      // Step 4: Save application
      setAutoApplyStatus({ type: 'loading', message: 'Saving application...' })
      const { data: application, error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: job.id,
          job_title: jobDetails.job_title,
          company: jobDetails.company_name,
          application_url: job.url,
          cover_letter: documents.coverLetter,
          tailored_cv: documents.tailoredCV,
          status: 'ready_to_submit',
          match_score: analysis.matchPercentage || job.fit_score,
          applied_at: new Date().toISOString(),
          auto_applied: true
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Update applied jobs set immediately
      setAppliedJobIds(prev => new Set([...prev, job.id]))
      
      // Update the job in the jobs list to show "Applied" badge
      setJobs(prevJobs => prevJobs.map(j => 
        j.id === job.id ? { ...j, applied: true } : j
      ))
      setAllJobs(prevJobs => prevJobs.map(j => 
        j.id === job.id ? { ...j, applied: true } : j
      ))
      
      setAutoApplyStatus({ 
        type: 'success', 
        message: '✅ Application materials ready! Saved to your dashboard.',
        application,
        documents
      })
      
    } catch (error) {
      console.error('❌ Auto-apply error:', error)
      setAutoApplyStatus({ 
        type: 'error', 
        message: error.message || 'Failed to generate application materials'
      })
    } finally {
      setAutoApplyLoading(false)
    }
  }
  
  // Auto-apply to multiple high-match jobs
  const handleBulkAutoApply = async () => {
    if (!user || !userProfile) {
      alert('Please upload your CV first to use auto-apply')
      return
    }
    
    const highMatchJobs = allJobs.filter(job => 
      (job.fit_score || 0) >= autoApplySettings.minMatchScore &&
      !appliedJobIds.has(job.id)
    ).slice(0, autoApplySettings.maxApplicationsPerDay)
    
    if (highMatchJobs.length === 0) {
      alert('No high-match jobs found to apply to')
      return
    }
    
    const confirmed = window.confirm(
      `Apply to ${highMatchJobs.length} high-match jobs (${autoApplySettings.minMatchScore}%+ match)?\n\n` +
      `This will generate tailored applications for:\n` +
      highMatchJobs.slice(0, 5).map(j => `• ${j.title} at ${j.company}`).join('\n') +
      (highMatchJobs.length > 5 ? `\n...and ${highMatchJobs.length - 5} more` : '')
    )
    
    if (!confirmed) return
    
    setShowAutoApplySettings(false)
    setAutoApplyLoading(true)
    
    const results = []
    for (let i = 0; i < highMatchJobs.length; i++) {
      const job = highMatchJobs[i]
      setAutoApplyStatus({ 
        type: 'loading', 
        message: `Processing ${i + 1}/${highMatchJobs.length}: ${job.title}...`
      })
      
      try {
        await handleAutoApply(job)
        results.push({ job, success: true })
        
        // Rate limiting: Wait 3 seconds between applications
        if (i < highMatchJobs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      } catch (error) {
        results.push({ job, success: false, error: error.message })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    setAutoApplyStatus({ 
      type: 'success', 
      message: `✅ Completed! Successfully prepared ${successCount}/${highMatchJobs.length} applications`
    })
    setAutoApplyLoading(false)
  }
  
  // Apply filters, search, and sorting
  const applyFiltersAndSort = () => {
    let filtered = [...allJobs]
    
    console.log(`🔍 Applying filters - Current filter: ${filter}, Total jobs: ${allJobs.length}`)
    
    // Apply UI filter (all, new, high-fit)
    if (filter === 'new') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      console.log(`📅 Looking for jobs newer than: ${oneDayAgo.toISOString()}`)
      const beforeCount = filtered.length
      filtered = filtered.filter(job => new Date(job.scraped_at) > oneDayAgo)
      console.log(`📅 New jobs filter: ${beforeCount} → ${filtered.length} jobs`)
      console.log('📅 Sample job dates:', filtered.slice(0, 3).map(j => ({ title: j.title, scraped_at: j.scraped_at })))
    } else if (filter === 'high-fit') {
      const beforeCount = filtered.length
      filtered = filtered.filter(job => (job.fit_score || 0) >= 70)
      console.log(`🎯 High-fit filter: ${beforeCount} → ${filtered.length} jobs`)
    }
    
    // Apply search query (using pre-computed search index for performance)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchingIds = new Set(
        searchIndex
          .filter(item => item.searchText.includes(query))
          .map(item => item.id)
      )
      filtered = filtered.filter(job => matchingIds.has(job.id))
    }
    
    // Apply salary filter
    if (salaryFilter.min || salaryFilter.max) {
      filtered = filtered.filter(job => {
        if (!job.salary_range) return false
        const salaryMatch = job.salary_range.match(/\$?([\d,]+)k?/i)
        if (!salaryMatch) return false
        const salary = parseInt(salaryMatch[1].replace(/,/g, ''))
        if (salaryFilter.min && salary < parseInt(salaryFilter.min)) return false
        if (salaryFilter.max && salary > parseInt(salaryFilter.max)) return false
        return true
      })
    }
    
    // Apply employment type filter
    if (employmentTypeFilter !== 'all') {
      filtered = filtered.filter(job => 
        job.employment_type?.toLowerCase() === employmentTypeFilter.toLowerCase()
      )
    }
    
    // Apply company filter
    if (companyFilter.trim()) {
      const company = companyFilter.toLowerCase()
      filtered = filtered.filter(job => 
        job.company?.toLowerCase().includes(company)
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          // Use posted_date if available, fallback to scraped_at
          const dateA = new Date(a.posted_date || a.scraped_at)
          const dateB = new Date(b.posted_date || b.scraped_at)
          comparison = dateB - dateA
          break
        case 'fit':
          comparison = (b.fit_score || 0) - (a.fit_score || 0)
          break
        case 'salary':
          const getSalary = (job) => {
            if (!job.salary_range) return 0
            const match = job.salary_range.match(/\$?([\d,]+)k?/i)
            return match ? parseInt(match[1].replace(/,/g, '')) : 0
          }
          comparison = getSalary(b) - getSalary(a)
          break
        case 'company':
          comparison = (a.company || '').localeCompare(b.company || '')
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? -comparison : comparison
    })
    
    console.log(`🎯 Final filtered jobs: ${filtered.length}`)
    console.log('🎯 Sample final jobs:', filtered.slice(0, 3).map(j => ({ title: j.title, company: j.company })))
    setJobs(filtered)
  }
  
  // Calculate detailed fit score breakdown (100-point scale, no inflation)
  const calculateFitBreakdown = (job, userPreferences = {}) => {
    const breakdown = {
      keywordMatch: 0,
      titleMatch: 0,
      locationMatch: 0,
      recency: 0,
      total: 0,
      details: []
    }
    
    const keywords = userPreferences.keywords || []
    const title = job.title?.toLowerCase() || ''
    const description = job.description?.toLowerCase() || ''
    
    // Title keyword matching (50 points max) - Highest priority
    if (keywords.length > 0) {
      const titleMatches = keywords.filter(keyword => 
        title.includes(keyword.toLowerCase())
      )
      breakdown.titleMatch = Math.round((titleMatches.length / keywords.length) * 50)
      
      if (titleMatches.length > 0) {
        breakdown.details.push({
          category: 'Title Match',
          score: breakdown.titleMatch,
          max: 50,
          description: `${titleMatches.length} of ${keywords.length} keywords in title`
        })
      }
    }
    
    // Description keyword matching (30 points max) - Secondary priority
    if (keywords.length > 0) {
      const descMatches = keywords.filter(keyword => {
        const kw = keyword.toLowerCase()
        // Count occurrences in description
        const count = (description.match(new RegExp(kw, 'g')) || []).length
        // Award points based on frequency (1 occurrence = 50%, 2+ = 100%)
        return count >= 1
      })
      
      // Weighted by frequency
      const descScore = keywords.reduce((score, keyword) => {
        const kw = keyword.toLowerCase()
        const count = (description.match(new RegExp(kw, 'g')) || []).length
        if (count === 0) return score
        if (count === 1) return score + (30 / keywords.length) * 0.5
        return score + (30 / keywords.length)
      }, 0)
      
      breakdown.keywordMatch = Math.round(descScore)
      
      if (descMatches.length > 0) {
        breakdown.details.push({
          category: 'Description Match',
          score: breakdown.keywordMatch,
          max: 30,
          description: `${descMatches.length} keywords found in description`
        })
      }
    }
    
    // Location matching (15 points)
    if (userPreferences.locations && userPreferences.locations.length > 0) {
      const locationMatch = userPreferences.locations.some(loc =>
        job.location?.toLowerCase().includes(loc.toLowerCase())
      )
      breakdown.locationMatch = locationMatch ? 15 : 0
      breakdown.details.push({
        category: 'Location',
        score: breakdown.locationMatch,
        max: 15,
        description: locationMatch ? 'Matches preferred location' : 'Different location'
      })
    } else if (job.location?.toLowerCase().includes('remote')) {
      breakdown.locationMatch = 10
      breakdown.details.push({
        category: 'Location',
        score: 10,
        max: 15,
        description: 'Remote position'
      })
    }
    
    // Recency bonus (5 points)
    const daysSincePosted = (Date.now() - new Date(job.scraped_at)) / (1000 * 60 * 60 * 24)
    if (daysSincePosted < 1) {
      breakdown.recency = 5
      breakdown.details.push({
        category: 'Recency',
        score: 5,
        max: 5,
        description: 'Posted within 24 hours'
      })
    } else if (daysSincePosted < 7) {
      breakdown.recency = 3
      breakdown.details.push({
        category: 'Recency',
        score: 3,
        max: 5,
        description: 'Posted within a week'
      })
    } else if (daysSincePosted < 30) {
      breakdown.recency = 1
      breakdown.details.push({
        category: 'Recency',
        score: 1,
        max: 5,
        description: 'Posted within a month'
      })
    }
    
    // Total: Title (50) + Description (30) + Location (15) + Recency (5) = 100 points
    breakdown.total = Math.min(breakdown.titleMatch + breakdown.keywordMatch + breakdown.locationMatch + breakdown.recency, 100)
    
    return breakdown
  }
  
  // Bulk actions
  const toggleJobSelection = (jobId) => {
    const newSelected = new Set(selectedJobs)
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId)
    } else {
      newSelected.add(jobId)
    }
    setSelectedJobs(newSelected)
  }
  
  const selectAllOnPage = () => {
    const pageJobs = getPaginatedJobs()
    const newSelected = new Set(selectedJobs)
    pageJobs.forEach(job => newSelected.add(job.id))
    setSelectedJobs(newSelected)
  }
  
  const deselectAll = () => {
    setSelectedJobs(new Set())
  }
  
  const bulkSaveJobs = async () => {
    for (const jobId of selectedJobs) {
      await saveJob(jobId)
    }
    setSelectedJobs(new Set())
  }
  
  const bulkDismissJobs = async () => {
    for (const jobId of selectedJobs) {
      await dismissJob(jobId)
    }
    setSelectedJobs(new Set())
  }
  
  // Job comparison
  const addToComparison = (job) => {
    if (comparisonJobs.length < 3 && !comparisonJobs.find(j => j.id === job.id)) {
      setComparisonJobs([...comparisonJobs, job])
    }
  }
  
  const removeFromComparison = (jobId) => {
    setComparisonJobs(comparisonJobs.filter(j => j.id !== jobId))
  }
  
  // Pagination
  const getPaginatedJobs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return jobs.slice(startIndex, endIndex)
  }
  
  const totalPages = Math.ceil(jobs.length / itemsPerPage)
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate basic fit score for cached jobs
  const calculateBasicFitScore = (job, userPreferences = {}) => {
    let score = 50 // Base score
    
    // Use user's keywords if available, otherwise use defaults
    const keywords = userPreferences.keywords || ['product manager', 'software engineer', 'developer', 'manager']
    const text = `${job.title} ${job.description}`.toLowerCase()
    
    // Keyword matching (40 points max)
    const matchedKeywords = keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    )
    score += (matchedKeywords.length / keywords.length) * 40
    
    // Location matching (20 points)
    if (userPreferences.locations && userPreferences.locations.length > 0) {
      const locationMatch = userPreferences.locations.some(loc =>
        job.location?.toLowerCase().includes(loc.toLowerCase())
      )
      if (locationMatch) score += 20
    } else if (job.location?.toLowerCase().includes('remote')) {
      score += 15
    }
    
    // Recent jobs get bonus (10 points)
    const daysSincePosted = (Date.now() - new Date(job.scraped_at)) / (1000 * 60 * 60 * 24)
    if (daysSincePosted < 1) score += 10
    
    return Math.min(Math.round(score), 100)
  }

  // Automatically trigger initial scraping when no jobs are found
  const triggerInitialScrape = async () => {
    try {
      setIsInitialScraping(true)
      console.log('🔄 Starting automatic initial job scraping...')
      
      // Import job scraper service
      const { jobScraperService } = await import('../lib/jobScraper')
      
      // Scrape real jobs
      const jobs = await jobScraperService.runDailyJobUpdate()
      console.log(`✅ Scraping complete: ${jobs?.length || 0} jobs found`)
      
      // Reload jobs after scraping
      setTimeout(() => {
        console.log('🔄 Reloading jobs after initial scrape...')
        loadJobs()
        setIsInitialScraping(false)
      }, 2000) // Give it 2 seconds to process
      
    } catch (error) {
      console.error('❌ Error in automatic initial scrape:', error)
      setIsInitialScraping(false)
    }
  }


  const markAsViewed = async (jobId) => {
    await supabase
      .from('scraped_jobs')
      .update({ is_new: false })
      .eq('id', jobId)
  }

  const saveJob = async (jobId) => {
    await supabase
      .from('scraped_jobs')
      .update({ is_saved: true })
      .eq('id', jobId)
    
    loadJobs()
  }

  const dismissJob = async (jobId) => {
    await supabase
      .from('scraped_jobs')
      .update({ is_dismissed: true })
      .eq('id', jobId)
    
    loadJobs()
  }

  // Connection badge feature - disabled for now (will add in future)
  // const getConnectionBadge = (connectionFlag) => { ... }

  const getFitScoreBadge = (score) => {
    if (!score) return null
    
    let color = 'bg-gray-100 text-gray-800'
    if (score >= 80) color = 'bg-green-100 text-green-800'
    else if (score >= 70) color = 'bg-blue-100 text-blue-800'
    else if (score >= 60) color = 'bg-yellow-100 text-yellow-800'
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${color}`}>
        <TrendingUp size={12} />
        {score}% Match
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Minimalist Header */}
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-900 overflow-hidden border-b border-gray-200">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-gray-200 shadow-sm">
                <Sparkles size={16} className="text-gray-600" />
                <span className="text-gray-700">AI-Powered Discovery</span>
              </div>
            </div>
            <div className="hidden md:flex gap-3">
              <button
                onClick={async () => {
                  try {
                    setLoading(true)
                    const { jobScraperService } = await import('../lib/jobScraper')
                    const { data: { user } } = await supabase.auth.getUser()
                    const jobs = await jobScraperService.scrapeJobs({ user_id: user.id, target_companies: [] })
                    alert(`✅ Found ${jobs.length} jobs using your preferences!`)
                    loadJobs()
                  } catch (error) {
                    console.error('Scraper error:', error)
                    alert(`❌ Error: ${error.message}`)
                  } finally {
                    setLoading(false)
                  }
                }}
                className="group px-6 py-2.5 bg-white hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-200 text-gray-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <Zap size={16} className="text-gray-600 group-hover:scale-110 transition-transform" />
                Discover New Jobs
              </button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-gray-900">
              Find Your Dream Job 🎯
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Discover <span className="font-semibold text-gray-900">{allJobs.length} curated opportunities</span> matching your profile
            </p>

            {/* Quick Stats - Prominent Display */}
            <div className="flex items-center justify-center gap-6 md:gap-8 text-sm mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <Target size={18} className="text-green-600" />
                <span className="text-gray-700">
                  <span className="font-bold text-green-700">{jobs.filter(j => (j.fit_score || 0) >= 70).length}</span> High Fit
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                <Sparkles size={18} className="text-orange-600" />
                <span className="text-gray-700">
                  <span className="font-bold text-orange-700">{jobs.filter(j => j.is_new).length}</span> New Today
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp size={18} className="text-blue-600" />
                <span className="text-gray-700">
                  <span className="font-bold text-blue-700">{jobs.filter(j => appliedJobIds.has(j.id)).length}</span> Applied
                </span>
              </div>
            </div>
          </div>
          
          {/* Modern Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2 border border-gray-200">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by job title, company, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-0 focus:ring-0 text-gray-900 rounded-lg text-base placeholder-gray-400"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
              <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2 group">
                <Search size={18} />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showAdvancedFilters ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FilterIcon size={20} className="text-gray-700" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="md:hidden text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Filters</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                      filter === 'all' 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Briefcase size={18} />
                        All Jobs
                      </span>
                      <span className={`text-sm font-bold ${filter === 'all' ? 'text-white' : 'text-gray-900'}`}>{allJobs.length}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setFilter('new')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                      filter === 'new' 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} />
                        New (24h)
                      </span>
                      <span className={`text-sm font-bold ${filter === 'new' ? 'text-white' : 'text-gray-900'}`}>
                        {allJobs.filter(job => new Date(job.scraped_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setFilter('high-fit')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                      filter === 'high-fit' 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Target size={18} />
                      High Fit (70%+)
                    </span>
                  </button>
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Employment Type</label>
                <select
                  value={employmentTypeFilter}
                  onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 font-medium text-gray-700"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Salary Range (in thousands)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={salaryFilter.min}
                    onChange={(e) => setSalaryFilter({ ...salaryFilter, min: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={salaryFilter.max}
                    onChange={(e) => setSalaryFilter({ ...salaryFilter, max: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 font-medium"
                  />
                </div>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 font-medium"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSalaryFilter({ min: '', max: '' })
                  setEmploymentTypeFilter('all')
                  setCompanyFilter('')
                  setSearchQuery('')
                  setFilter('all')
                }}
                className="w-full px-4 py-3 text-sm text-gray-700 hover:text-gray-900 font-semibold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <X size={16} />
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main Job Listings */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="md:hidden w-full mb-6 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all"
            >
              <FilterIcon size={20} />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </button>

            {/* Job Scraping Controls */}
            <div className="mb-6">
              <SimpleJobControls onJobsUpdated={loadJobs} />
            </div>

            {/* CV Upload Prompt - Show if user hasn't uploaded CV */}
            {user && !userProfile && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🎯 Get Better Job Matches with Your CV
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload your CV to get AI-powered job matching based on your skills, experience, and qualifications. 
                      We'll analyze your CV and show you the best-fit jobs with detailed match scores.
                    </p>
                    <a
                      href="/profile"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <FileText size={18} />
                      Upload Your CV
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* CV Match Info - Show if user has uploaded CV */}
            {userProfile && userProfile.master_experience && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="text-green-600" size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    ✅ CV-Based Matching Active
                  </p>
                  <p className="text-xs text-green-700">
                    Jobs are ranked by how well they match your skills and experience
                  </p>
                </div>
              </div>
            )}

      {/* Bulk Actions Bar */}
      {selectedJobs.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedJobs.size} job{selectedJobs.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={deselectAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Deselect All
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={bulkSaveJobs}
              className="btn-primary-small flex items-center gap-1"
            >
              <Bookmark size={14} />
              Save Selected
            </button>
            <button
              onClick={bulkDismissJobs}
              className="btn-secondary-small flex items-center gap-1"
            >
              <X size={14} />
              Dismiss Selected
            </button>
          </div>
        </div>
      )}

      {/* Comparison Bar */}
      {comparisonJobs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GitCompare size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Comparing {comparisonJobs.length} job{comparisonJobs.length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="btn-primary-small"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {comparisonJobs.map(job => (
              <div key={job.id} className="bg-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <span className="font-medium">{job.title}</span>
                <span className="text-gray-500">at {job.company}</span>
                <button
                  onClick={() => removeFromComparison(job.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

            {/* Jobs List */}
            {loading ? (
              <div className="space-y-4">
                {/* Skeleton Loaders */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0"></div>
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="flex gap-4 mb-3">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
                {isInitialScraping ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Finding Jobs for You</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      We're searching multiple job boards to find opportunities that match your profile. This usually takes 30-60 seconds.
                    </p>
                  </>
                ) : (
                  <>
                    <Briefcase className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery || salaryFilter.min || salaryFilter.max || companyFilter || employmentTypeFilter !== 'all'
                        ? "Try adjusting your filters or search query to see more results."
                        : "We haven't found any jobs matching your preferences yet. Try scraping for new opportunities or check back soon!"}
                    </p>
                  </>
                )}
                {(searchQuery || salaryFilter.min || salaryFilter.max || companyFilter || employmentTypeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSalaryFilter({ min: '', max: '' })
                      setEmploymentTypeFilter('all')
                      setCompanyFilter('')
                    }}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
          {/* Select All Button */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={selectAllOnPage}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              <CheckSquare size={16} />
              Select All on Page
            </button>
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, jobs.length)} of {jobs.length} jobs
            </span>
          </div>

          <div className="space-y-3">
            {getPaginatedJobs().map((job) => (
              <div
                key={job.id}
                className={`bg-white rounded-xl border hover:shadow-md transition-all duration-200 ${
                  job.is_new ? 'border-gray-300' : 'border-gray-200'
                } ${selectedJobs.has(job.id) ? 'ring-2 ring-gray-900 border-gray-900' : ''}`}
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleJobSelection(job.id)
                      }}
                      className="mt-1 text-gray-300 hover:text-gray-900 flex-shrink-0"
                    >
                      {selectedJobs.has(job.id) ? (
                        <CheckSquare size={20} className="text-gray-900" />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-gray-700 cursor-pointer">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 font-medium text-sm">{job.company}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addToComparison(job)
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              comparisonJobs.find(j => j.id === job.id)
                                ? 'text-gray-900 bg-gray-100'
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                            title="Compare"
                          >
                            <GitCompare size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              saveJob(job.id)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Bookmark size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              dismissJob(job.id)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Dismiss"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Job Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        {job.salary_range && (
                          <div className="flex items-center gap-1 font-medium text-gray-700">
                            <DollarSign size={15} />
                            {job.salary_range}
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={15} />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock size={15} />
                          {formatPostedDate(job.posted_date, job.source)}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {stripHtml(job.description)}
                      </p>

                      {/* Badges and Actions Row */}
                      <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-100">
                        {/* Left: Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {job.employment_type && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              {job.employment_type}
                            </span>
                          )}
                          {job.fit_score && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowFitScoreModal(job)
                              }}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
                            >
                              <Target size={12} />
                              {job.fit_score}% Match
                            </button>
                          )}
                          {appliedJobIds.has(job.id) && (
                            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                              <Send size={12} />
                              Applied
                            </span>
                          )}
                          {job.is_new && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <Sparkles size={12} />
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedJobId(expandedJobId === job.id ? null : job.id)
                            }}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {expandedJobId === job.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {expandedJobId === job.id ? 'Less' : 'More'}
                          </button>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsViewed(job.id)
                            }}
                          >
                            <ExternalLink size={13} />
                            View
                          </a>
                          {!appliedJobIds.has(job.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAutoApply(job)
                              }}
                              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                              disabled={autoApplyLoading}
                            >
                              {autoApplyLoading && autoApplyModal?.id === job.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Zap size={13} />
                              )}
                              Quick Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Full Description */}
                  {expandedJobId === job.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Full Description</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {stripHtml(job.description)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Job Comparison Modal */}
      {showComparison && comparisonJobs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare size={24} className="text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Job Comparison</h2>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparisonJobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-600">Fit Score</span>
                        <span className="font-semibold text-primary-600">{job.fit_score}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-600">Location</span>
                        <span className="font-medium">{job.location || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-600">Salary</span>
                        <span className="font-medium">{job.salary_range || 'Not listed'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium">{job.employment_type || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-600">Source</span>
                        <span className="font-medium">{job.source || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">Posted</span>
                        <span className="font-medium">{formatPostedDate(job.posted_date, job.source)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} />
                        View Job
                      </a>
                      <button
                        onClick={() => removeFromComparison(job.id)}
                        className="btn-secondary w-full"
                      >
                        Remove from Comparison
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fit Score Breakdown Modal */}
      {showFitScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Fit Score Breakdown</h2>
              </div>
              <button
                onClick={() => setShowFitScoreModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary-600 mb-2">
                  {showFitScoreModal.fit_score}%
                </div>
                <p className="text-gray-600">Overall Match Score</p>
              </div>
              
              {showFitScoreModal.fit_breakdown?.details?.map((detail, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{detail.category}</span>
                    <span className="text-sm text-gray-600">{detail.score}/{detail.max} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(detail.score / detail.max) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{detail.description}</p>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  This score is calculated based on how well the job matches your preferences, including keywords, location, and recency.
                </p>
              </div>
            </div>
            
            <div className="border-t p-6">
              <button
                onClick={() => setShowFitScoreModal(null)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Apply Settings Modal */}
      {showAutoApplySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="text-blue-600" size={24} />
                  Bulk Auto-Apply Settings
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Apply to multiple high-match jobs automatically
                </p>
              </div>
              <button
                onClick={() => setShowAutoApplySettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>How it works:</strong> We'll analyze each job, generate tailored CV and cover letter, and prepare your application materials. You'll review and submit each one.
                </p>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Match Score
                  </label>
                  <select
                    value={autoApplySettings.minMatchScore}
                    onChange={(e) => setAutoApplySettings(prev => ({ ...prev, minMatchScore: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={60}>60% or higher</option>
                    <option value={70}>70% or higher (Recommended)</option>
                    <option value={80}>80% or higher (Very selective)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Applications
                  </label>
                  <select
                    value={autoApplySettings.maxApplicationsPerDay}
                    onChange={(e) => setAutoApplySettings(prev => ({ ...prev, maxApplicationsPerDay: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={3}>3 applications</option>
                    <option value={5}>5 applications (Recommended)</option>
                    <option value={10}>10 applications</option>
                    <option value={20}>20 applications</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
                <p className="text-sm text-gray-700">
                  Will apply to <strong>{allJobs.filter(j => (j.fit_score || 0) >= autoApplySettings.minMatchScore && !appliedJobIds.has(j.id)).slice(0, autoApplySettings.maxApplicationsPerDay).length}</strong> jobs matching your criteria:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {allJobs
                    .filter(j => (j.fit_score || 0) >= autoApplySettings.minMatchScore && !appliedJobIds.has(j.id))
                    .slice(0, Math.min(3, autoApplySettings.maxApplicationsPerDay))
                    .map(job => (
                      <li key={job.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {job.title} at {job.company} ({job.fit_score}% match)
                      </li>
                    ))}
                  {allJobs.filter(j => (j.fit_score || 0) >= autoApplySettings.minMatchScore && !appliedJobIds.has(j.id)).length > 3 && (
                    <li className="text-gray-500 italic">...and {allJobs.filter(j => (j.fit_score || 0) >= autoApplySettings.minMatchScore && !appliedJobIds.has(j.id)).length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowAutoApplySettings(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAutoApply}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
                disabled={allJobs.filter(j => (j.fit_score || 0) >= autoApplySettings.minMatchScore && !appliedJobIds.has(j.id)).length === 0}
              >
                <Zap size={16} />
                Start Auto-Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Apply Modal */}
      {autoApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="text-blue-600" size={24} />
                  Quick Apply
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {autoApplyModal.title} at {autoApplyModal.company}
                </p>
              </div>
              <button
                onClick={() => {
                  setAutoApplyModal(null)
                  setAutoApplyStatus(null)
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={autoApplyLoading}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Status Display */}
              {autoApplyStatus && (
                <div className={`p-4 rounded-lg border-2 ${
                  autoApplyStatus.type === 'loading' ? 'bg-blue-50 border-blue-200' :
                  autoApplyStatus.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {autoApplyStatus.type === 'loading' && (
                      <Loader2 className="text-blue-600 animate-spin" size={24} />
                    )}
                    {autoApplyStatus.type === 'success' && (
                      <CheckCircle2 className="text-green-600" size={24} />
                    )}
                    {autoApplyStatus.type === 'error' && (
                      <AlertCircle className="text-red-600" size={24} />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        autoApplyStatus.type === 'loading' ? 'text-blue-900' :
                        autoApplyStatus.type === 'success' ? 'text-green-900' :
                        'text-red-900'
                      }`}>
                        {autoApplyStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State - Show Documents */}
              {autoApplyStatus?.type === 'success' && autoApplyStatus.documents && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText size={18} />
                      Generated Documents
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Tailored CV</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const cleanCompany = autoApplyModal.company.replace(/[^a-z0-9]/gi, '_')
                              const cleanTitle = autoApplyModal.title.replace(/[^a-z0-9]/gi, '_')
                              const blob = new Blob([autoApplyStatus.documents.tailoredCV], { type: 'application/pdf' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `CV_${cleanCompany}_${cleanTitle}.pdf`
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => {
                              const cleanCompany = autoApplyModal.company.replace(/[^a-z0-9]/gi, '_')
                              const cleanTitle = autoApplyModal.title.replace(/[^a-z0-9]/gi, '_')
                              const blob = new Blob([autoApplyStatus.documents.tailoredCV], { type: 'text/plain' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `CV_${cleanCompany}_${cleanTitle}.txt`
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            TXT
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Cover Letter</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const cleanCompany = autoApplyModal.company.replace(/[^a-z0-9]/gi, '_')
                              const cleanTitle = autoApplyModal.title.replace(/[^a-z0-9]/gi, '_')
                              const blob = new Blob([autoApplyStatus.documents.coverLetter], { type: 'application/pdf' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `CoverLetter_${cleanCompany}_${cleanTitle}.pdf`
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => {
                              const cleanCompany = autoApplyModal.company.replace(/[^a-z0-9]/gi, '_')
                              const cleanTitle = autoApplyModal.title.replace(/[^a-z0-9]/gi, '_')
                              const blob = new Blob([autoApplyStatus.documents.coverLetter], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `CoverLetter_${cleanCompany}_${cleanTitle}.docx`
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            DOCX
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Strategic Brief</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const cleanCompany = autoApplyModal.company.replace(/[^a-z0-9]/gi, '_')
                              const cleanTitle = autoApplyModal.title.replace(/[^a-z0-9]/gi, '_')
                              const blob = new Blob([autoApplyStatus.documents.strategicBrief], { type: 'application/pdf' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `StrategicBrief_${cleanCompany}_${cleanTitle}.pdf`
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => {
                              const cleanCompany = autoApplyModal.company.replace(/[^a-z0-9]/gi, '_')
                              const cleanTitle = autoApplyModal.title.replace(/[^a-z0-9]/gi, '_')
                              const blob = new Blob([autoApplyStatus.documents.strategicBrief], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `StrategicBrief_${cleanCompany}_${cleanTitle}.docx`
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            DOCX
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Next Step:</strong> Your application materials are ready! Click the button below to open the job posting and submit your application.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setAutoApplyModal(null)
                  setAutoApplyStatus(null)
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                disabled={autoApplyLoading}
              >
                Close
              </button>
              {autoApplyStatus?.type === 'success' && (
                <>
                  <a
                    href="/dashboard"
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-lg flex items-center gap-2"
                  >
                    <Briefcase size={16} />
                    View on Dashboard
                  </a>
                  {autoApplyModal.url && (
                    <a
                      href={autoApplyModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Open Job & Apply
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
