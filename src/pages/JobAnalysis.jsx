import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { geminiService } from '../lib/gemini'
import { mindstudioService } from '../lib/mindstudio'
import { docxGenerator } from '../lib/docxGenerator'
import ResumeTemplateSelector from '../components/ResumeTemplateSelector'
import EditableCoverLetter from '../components/EditableCoverLetter'
import { calculateCVMatch } from '../lib/cvMatcher'
import { 
  Loader, 
  CheckCircle, 
  AlertCircle, 
  Target,
  FileText,
  Mail,
  Briefcase,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Send,
  ExternalLink
} from 'lucide-react'

export default function JobAnalysis() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)

  const [jobData, setJobData] = useState({
    job_title: '',
    company_name: '',
    job_url: '',
    job_description: ''
  })

  const [analysis, setAnalysis] = useState(null)
  const [generatedDocs, setGeneratedDocs] = useState({
    resume: null,
    coverLetter: null,
    brief: null
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const profileData = await supabaseHelpers.getPrimaryProfile(user.id)
      if (!profileData) {
        setError('Please create a profile first')
        setTimeout(() => navigate('/profile-setup'), 2000)
        return
      }
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)
    setCurrentStep(2) // Move to Analysis step immediately

    try {
      const parsedProfile = JSON.parse(profile.master_experience)
      
      let finalJobDescription = jobData.job_description
      let jobDetails
      
      // If URL is provided but no description, scrape it
      if (jobData.job_url && !jobData.job_description.trim()) {
        try {
          const scrapedData = await geminiService.scrapeAndExtractJob(jobData.job_url)
          
          finalJobDescription = scrapedData.job_description
          jobDetails = {
            job_title: scrapedData.job_title,
            company_name: scrapedData.company_name
          }
          
          // Update the form with fetched data
          setJobData(prev => ({
            ...prev,
            job_description: finalJobDescription,
            job_title: jobDetails.job_title,
            company_name: jobDetails.company_name
          }))
        } catch (error) {
          // If scraping fails (quota exceeded), ask user to paste description
          throw new Error('Unable to scrape job URL (API quota exceeded). Please paste the job description directly in the text area.')
        }
      } else if (finalJobDescription) {
        // Extract job details from provided description
        jobDetails = await geminiService.extractJobDetails(
          finalJobDescription,
          jobData.job_url
        )
        
        // Update job data with extracted details
        setJobData(prev => ({
          ...prev,
          job_title: jobDetails.job_title,
          company_name: jobDetails.company_name
        }))
      } else {
        throw new Error('Please provide either a job URL or job description')
      }
      
      const analysisResult = await geminiService.analyzeJobFit(
        finalJobDescription,
        parsedProfile
      )

      // Use simple CV matcher for job alignment
      const cvMatchScore = calculateCVMatch(profile, {
        title: jobDetails.job_title || jobData.job_title,
        description: finalJobDescription,
        company: jobDetails.company_name || jobData.company_name
      })

      // Use simple CV match results
      analysisResult.match_score = cvMatchScore.total
      analysisResult.matchPercentage = cvMatchScore.total
      analysisResult.breakdown = cvMatchScore
      console.log('📊 Simple CV match score:', cvMatchScore.total + '%')
      console.log('   Breakdown:', cvMatchScore)

      setAnalysis(analysisResult)
      setAnalyzing(false)
      
      // Note: Removed auto-generation to prevent race condition
      // User can click "Generate Application Materials" when ready
    } catch (error) {
      console.error('Error analyzing job:', error)
      setError(error.message || 'Failed to analyze job')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateDocuments = async () => {
    setGenerating(true)
    setError(null)

    try {
      const parsedProfile = JSON.parse(profile.master_experience)
      
      // Step 1: Generate content - with individual error handling
      let resumeContent, coverLetterText, brief
      
      try {
        console.log('🚀 Starting document generation...')
        console.log('📋 Generating:', 
          !generatedDocs.resumeContent ? 'Resume' : '',
          !generatedDocs.coverLetterText ? 'Cover Letter' : '',
          !generatedDocs.brief ? 'Strategic Brief' : ''
        )
        console.log('📊 JobData for generation:')
        console.log('  job_title:', jobData.job_title)
        console.log('  company_name:', jobData.company_name)
        console.log('  job_description length:', jobData.job_description?.length)
        
        const results = await Promise.allSettled([
          geminiService.generateResumeContent(
            jobData.job_description,
            parsedProfile,
            analysis
          ),
          geminiService.generateCoverLetterText(
            jobData.job_description,
            jobData.company_name,
            jobData.job_title,
            parsedProfile,
            analysis
          ),
          geminiService.generateStrategicBrief(
            jobData.job_description,
            jobData.company_name,
            parsedProfile,
            analysis
          )
        ])
        
        // Extract results, handling failures gracefully
        resumeContent = results[0].status === 'fulfilled' ? results[0].value : null
        coverLetterText = results[1].status === 'fulfilled' ? results[1].value : null
        brief = results[2].status === 'fulfilled' ? results[2].value : null
        
        // Log any failures with details
        if (results[0].status === 'rejected') {
          console.error('❌ Resume generation failed:', results[0].reason)
        } else {
          console.log('✅ Resume generated successfully')
        }
        
        if (results[1].status === 'rejected') {
          console.error('❌ Cover letter generation failed:', results[1].reason)
          console.log('🔄 Attempting to generate cover letter via MindStudio...')
          
          // Try to generate via MindStudio as fallback
          try {
            coverLetterText = await mindstudioService.generateCoverLetter(
              jobData.job_description,
              jobData.company_name,
              jobData.job_title,
              parsedProfile,
              analysis
            )
            console.log('✅ Cover letter generated via MindStudio')
          } catch (mindstudioError) {
            console.error('❌ MindStudio cover letter also failed:', mindstudioError)
            // Last resort: use existing MindStudio cover letter from analysis if available
            if (analysis?.coverLetter) {
              coverLetterText = analysis.coverLetter
              console.log('✅ Using cached MindStudio cover letter')
            }
          }
        } else {
          console.log('✅ Cover letter generated successfully')
        }
        
        if (results[2].status === 'rejected') {
          console.error('❌ Strategic brief generation failed:', results[2].reason)
        } else {
          console.log('✅ Strategic brief generated successfully')
        }
        
        // If all failed, throw error with helpful message
        if (!resumeContent && !coverLetterText && !brief) {
          throw new Error('All documents failed to generate. This may be due to API rate limiting. Please wait 60 seconds and try again.')
        }
        
        // Show warning if some failed
        if (!resumeContent || !coverLetterText || !brief) {
          setError('Some documents failed to generate. You can retry individual documents.')
        }
      } catch (err) {
        throw new Error('Failed to generate documents: ' + err.message)
      }

      // Step 2: Store content for editable display, preserving existing successful documents
      setGeneratedDocs(prev => ({ 
        resumeContent: resumeContent || prev.resumeContent,
        coverLetterText: coverLetterText || prev.coverLetterText,
        brief: brief || prev.brief
      }))
      // Move to step 3 to show documents
      setCurrentStep(3)
    } catch (error) {
      console.error('Error generating documents:', error)
      setError(error.message || 'Failed to generate documents')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const applicationData = {
        user_id: user.id,
        profile_id: profile.id,
        job_title: jobData.job_title,
        company_name: jobData.company_name,
        job_description: jobData.job_description,
        job_url: jobData.job_url,
        match_score: analysis.match_score || analysis.matchPercentage || 0,
        status: 'draft',
        drafts: {
          analysis,
          resumeContent: generatedDocs.resumeContent,
          coverLetterText: generatedDocs.coverLetterText,
          brief: generatedDocs.brief
        }
      }

      const savedApp = await supabaseHelpers.createApplication(applicationData)
      navigate(`/application/${savedApp.id}`)
    } catch (error) {
      console.error('Error saving application:', error)
      setError('Failed to save application')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header - Modern SaaS Style */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium mb-6 text-blue-700">
            <Target size={16} />
            <span>Smart Job Matching</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            New Job Application
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Analyze a job posting and generate tailored application materials in 
            <span className="font-semibold text-blue-600"> minutes, not hours</span>
          </p>
        </div>

        {/* Progress Steps - Modern SaaS Card Style */}
        <div className="card-modern">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-blue-700' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${currentStep >= 1 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">Job Details</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
            <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-blue-700' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${currentStep >= 2 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Analysis</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
            <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-blue-700' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${currentStep >= 3 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">Documents</span>
            </div>
          </div>
        </div>

        {/* Step 1: Job Details */}
        {currentStep === 1 && (
          <div className="card-highlight">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <FileText className="text-white" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Add Job Posting</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Provide a job URL or paste the description. AI will automatically extract all details.
            </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Job URL</label>
              <input
                type="url"
                value={jobData.job_url}
                onChange={(e) => setJobData({ ...jobData, job_url: e.target.value })}
                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all text-lg"
                placeholder="https://linkedin.com/jobs/view/..."
              />
              <p className="text-sm text-gray-600 mt-2">
                AI will fetch and extract the job details automatically
              </p>
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Job Description</label>
              <textarea
                value={jobData.job_description}
                onChange={(e) => setJobData({ ...jobData, job_description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-violet-400 transition-colors min-h-[300px] font-mono text-sm"
                placeholder="Paste the full job description here...

Example:
Senior Product Manager at Google
Location: Mountain View, CA
About the role: We're looking for..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Paste the job posting if you don't have a URL
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!jobData.job_url && !jobData.job_description)}
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Target size={20} />
                  Analyze Job Fit
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Analysis Results */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {analyzing ? (
            <div className="card-modern">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-6">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Application</h3>
                <p className="text-gray-600 mb-8">Reviewing job requirements and preparing your materials</p>
                
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Extracting job details</span>
                    <CheckCircle className="text-green-500" size={16} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Matching qualifications</span>
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Preparing documents</span>
                    <div className="w-4 h-4 border-2 border-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Finalizing analysis</span>
                    <div className="w-4 h-4 border-2 border-gray-200 rounded-full"></div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-8">Usually takes 30-60 seconds</p>
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Match Score */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-12 border-2 border-violet-100">
                <div className="text-center">
                  <div className="text-6xl font-black text-violet-600 mb-2">
                    {analysis.matchPercentage || analysis.match_score}%
                  </div>
                  <div className="text-lg text-gray-700">Match Score</div>
                </div>
              </div>

              {/* Requirements Met & Skill Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 border-2 border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    Requirements Met
                  </h3>
                  <ul className="space-y-3">
                    {(analysis.requirementsMet || analysis.strengths || []).map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {typeof item === 'string' ? item : item.requirement}
                          </div>
                          {typeof item === 'object' && item.evidence && (
                            <div className="text-xs text-gray-500 mt-1 italic">
                              "{item.evidence}"
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-3xl p-8 border-2 border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-yellow-600" size={20} />
                    Skill Gaps
                  </h3>
                  <ul className="space-y-3">
                    {(analysis.skillGaps || analysis.gaps || []).map((gap, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-yellow-600 mt-1 flex-shrink-0">!</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {typeof gap === 'string' ? gap : (gap.skill || gap.name || gap)}
                          </div>
                          {typeof gap === 'object' && gap.importance && (
                            <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                              gap.importance === 'critical' ? 'bg-red-100 text-red-700' : 
                              gap.importance === 'important' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {gap.importance}
                            </span>
                          )}
                          {typeof gap === 'object' && gap.explanation && (
                            <div className="text-xs text-gray-600 mt-1">
                              {gap.explanation}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {(analysis.skillGaps || analysis.gaps || []).length === 0 && (
                      <li className="text-sm text-gray-500 italic">
                        No significant skill gaps identified! You have strong alignment with the role requirements.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Improvement Suggestions */}
              {(analysis.improvementSuggestions || analysis.recommendations) && (
                <div className="bg-white rounded-3xl p-8 border-2 border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Improvement Suggestions</h3>
                  <ul className="space-y-2">
                    {(analysis.improvementSuggestions || analysis.recommendations || []).map((rec, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-primary-600 mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Document Generation Status */}
              {generating && (
                <div className="card bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Preparing Documents</h3>
                      <p className="text-sm text-gray-600">Customizing your resume, cover letter, and strategic brief</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation to Documents */}
              {!generating && (generatedDocs.resumeContent || generatedDocs.coverLetterText) && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FileText size={20} />
                    View Documents
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn-secondary"
                  >
                    Back to Job Details
                  </button>
                </div>
              )}
            </>
          ) : null}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleGenerateDocuments}
              disabled={generating}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Preparing Materials...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generate Application Materials
                </>
              )}
            </button>
            
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-secondary"
              disabled={generating}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generated Documents */}
      {currentStep === 3 && (generatedDocs.resumeContent || generatedDocs.coverLetterText) && (
        <div className="space-y-6">
          <div className="card-success">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Application Materials Ready</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { key: 'resumeContent', label: 'Resume', icon: '📄' },
                    { key: 'coverLetterText', label: 'Cover Letter', icon: '✉️' },
                    { key: 'brief', label: 'Strategic Brief', icon: '📋' }
                  ].map(({ key, label, icon }) => (
                    <div key={key} className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      generatedDocs[key] 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <span className="text-lg">{icon}</span>
                      <span className="font-medium text-sm">{label}</span>
                      {generatedDocs[key] ? (
                        <CheckCircle className="text-emerald-600 ml-auto" size={16} />
                      ) : (
                        <AlertCircle className="text-red-600 ml-auto" size={16} />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Your personalized application materials are ready for review and download.
                </p>
              </div>
            </div>
          </div>

          {/* Editable Resume with Template Selector */}
          {generatedDocs.resumeContent && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Tailored Resume
              </h3>
              <ResumeTemplateSelector 
                resumeContent={generatedDocs.resumeContent}
                jobTitle={jobData.job_title}
                companyName={jobData.company_name}
              />
            </div>
          )}

          {/* Editable Cover Letter */}
          {generatedDocs.coverLetterText && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="text-accent-600" size={20} />
                Cover Letter
              </h3>
              <EditableCoverLetter 
                coverLetterText={generatedDocs.coverLetterText}
                candidateName={generatedDocs.resumeContent?.personalDetails?.name || 'Candidate'}
                companyName={jobData.company_name}
                profileData={profile}
                jobTitle={jobData.job_title}
              />
            </div>
          )}

          {/* Strategic Brief */}
          {generatedDocs.brief && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="text-primary-600" size={20} />
                Strategic Brief
              </h3>
              <div className="space-y-6">
                {/* Case Study */}
                {generatedDocs.brief.case_study && (
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">1. Relevant Projects / Case Study</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 text-lg">{generatedDocs.brief.case_study.title}</h5>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 leading-relaxed">{generatedDocs.brief.case_study.opening_paragraph}</p>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">Vision & Value Proposition:</h6>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">{generatedDocs.brief.case_study.vision_and_value}</div>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">Anchored in Proven Results (from CV):</h6>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">{generatedDocs.brief.case_study.proven_results}</div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 leading-relaxed font-medium">{generatedDocs.brief.case_study.closing_statement}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 90-Day Plan */}
                {generatedDocs.brief.ninety_day_plan && (
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">2. 90-Day Plan</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      {generatedDocs.brief.ninety_day_plan.opening_statement && (
                        <p className="text-gray-600 leading-relaxed font-medium">{generatedDocs.brief.ninety_day_plan.opening_statement}</p>
                      )}
                      
                      {generatedDocs.brief.ninety_day_plan.phase_1 && (
                        <div>
                          <h5 className="font-semibold text-blue-600 mb-2">{generatedDocs.brief.ninety_day_plan.phase_1.title}</h5>
                          <ul className="space-y-1">
                            {generatedDocs.brief.ninety_day_plan.phase_1.actions.map((action, i) => (
                              <li key={i} className="text-gray-600 text-sm">• {action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {generatedDocs.brief.ninety_day_plan.phase_2 && (
                        <div>
                          <h5 className="font-semibold text-blue-600 mb-2">{generatedDocs.brief.ninety_day_plan.phase_2.title}</h5>
                          <ul className="space-y-1">
                            {generatedDocs.brief.ninety_day_plan.phase_2.actions.map((action, i) => (
                              <li key={i} className="text-gray-600 text-sm">• {action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {generatedDocs.brief.ninety_day_plan.phase_3 && (
                        <div>
                          <h5 className="font-semibold text-blue-600 mb-2">{generatedDocs.brief.ninety_day_plan.phase_3.title}</h5>
                          <ul className="space-y-1">
                            {generatedDocs.brief.ninety_day_plan.phase_3.actions.map((action, i) => (
                              <li key={i} className="text-gray-600 text-sm">• {action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {generatedDocs.brief.ninety_day_plan.closing_statement && (
                        <p className="text-gray-600 leading-relaxed font-medium italic">{generatedDocs.brief.ninety_day_plan.closing_statement}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* KPIs */}
                {generatedDocs.brief.kpis && (
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">3. Key Performance Indicators (KPIs)</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      {generatedDocs.brief.kpis.opening_statement && (
                        <p className="text-gray-600 leading-relaxed font-medium">{generatedDocs.brief.kpis.opening_statement}</p>
                      )}
                      
                      <div className="space-y-3">
                        {generatedDocs.brief.kpis.metrics && generatedDocs.brief.kpis.metrics.map((metric, i) => (
                          <div key={i} className="border-l-4 border-blue-500 pl-4">
                            <div className="font-semibold text-gray-900 mb-1">{metric.name}</div>
                            <div className="text-gray-600 text-sm leading-relaxed">{metric.description}</div>
                          </div>
                        ))}
                      </div>
                      
                      {generatedDocs.brief.kpis.closing_statement && (
                        <p className="text-gray-600 leading-relaxed font-medium italic">{generatedDocs.brief.kpis.closing_statement}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleSaveApplication}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Save Application
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Start New Application
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
