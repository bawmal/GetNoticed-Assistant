import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, supabaseHelpers } from '../lib/supabase'
import ResumeTemplateSelector from '../components/ResumeTemplateSelector'
import EditableCoverLetter from '../components/EditableCoverLetter'
import { geminiService } from '../lib/gemini'
import { generateStrategicBriefPDF } from '../lib/pdfGenerator.jsx'
import { 
  ArrowLeft,
  FileText, 
  Mail, 
  Briefcase,
  Download,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react'

export default function ApplicationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('analysis')
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    loadApplication()
  }, [id])

  const loadApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const apps = await supabaseHelpers.getApplications(user.id)
      const app = apps.find(a => a.id === id)
      
      if (!app) {
        navigate('/dashboard')
        return
      }

      setApplication(app)
    } catch (error) {
      console.error('Error loading application:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await supabaseHelpers.updateApplication(id, { status: newStatus })
      setApplication({ ...application, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) return
    
    try {
      await supabaseHelpers.deleteApplication(id)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const handleRegenerateDocuments = async () => {
    if (!confirm('This will regenerate the resume and cover letter with the latest templates. Continue?')) {
      return
    }

    setRegenerating(true)
    try {
      console.log('Starting document regeneration...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('Fetching user profile...')
      // Get user profile (primary profile)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('master_experience')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        throw new Error(`Failed to fetch profile: ${profileError.message}`)
      }

      const profile = typeof profileData?.master_experience === 'string' 
        ? JSON.parse(profileData.master_experience)
        : profileData?.master_experience
      if (!profile) {
        throw new Error('No CV found in profile. Please upload your CV first.')
      }

      console.log('Profile loaded, generating documents...')
      
      // Regenerate documents
      const [newResume, newCoverLetter, newBrief] = await Promise.all([
        geminiService.generateResumeContent(
          application.job_description,
          profile,
          application.drafts?.analysis
        ),
        geminiService.generateCoverLetterText(
          application.job_description,
          application.company_name,
          application.job_title,
          profile,
          application.drafts?.analysis
        ),
        geminiService.generateStrategicBrief(
          application.job_description,
          application.company_name,
          profile,
          application.drafts?.analysis
        )
      ])

      console.log('Documents generated, updating database...')

      // Update application with new documents
      const updatedDrafts = {
        ...application.drafts,
        resumeContent: newResume,
        coverLetterText: newCoverLetter,
        brief: newBrief
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update({ drafts: updatedDrafts })
        .eq('id', id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(`Failed to update application: ${updateError.message}`)
      }

      console.log('Database updated, reloading page...')
      
      // Reload the entire page to get the latest template code
      alert('Documents regenerated successfully! The page will now reload.')
      window.location.reload()
    } catch (error) {
      console.error('Error regenerating documents:', error)
      alert(`Failed to regenerate documents: ${error.message}`)
    } finally {
      setRegenerating(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      applied: 'bg-blue-100 text-blue-700',
      interviewing: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      accepted: 'bg-purple-100 text-purple-700'
    }
    return colors[status] || colors.draft
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!application) return null

  const { drafts } = application
  const analysis = drafts?.analysis
  const resumeContent = drafts?.resumeContent
  const coverLetterText = drafts?.coverLetterText
  const brief = drafts?.brief

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header - Modern SaaS Style */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {application.job_title}
            </h1>
            <p className="text-lg text-gray-600 mt-1">{application.company_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerateDocuments}
              disabled={regenerating}
              className="btn-secondary-small disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-2 rounded-lg font-medium border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all ${getStatusColor(application.status)}`}
            >
              <option value="draft">Draft</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
      </div>

      {/* Quick Info */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Match Score</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {application.match_score}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {application.status}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Created</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(application.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Job Posting</div>
            {application.job_url ? (
              <a
                href={application.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View <ExternalLink size={16} />
              </a>
            ) : (
              <span className="text-gray-400">No URL</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              {[
                { id: 'analysis', label: 'Analysis', icon: CheckCircle },
                { id: 'resume', label: 'Resume', icon: FileText },
                { id: 'cover-letter', label: 'Cover Letter', icon: Mail },
                { id: 'brief', label: 'Strategic Brief', icon: Briefcase },
                { id: 'interview-prep', label: 'Interview Prep', icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
            {resumeContent && coverLetterText && brief && (
              <button
                onClick={async () => {
                  const { generateTraditionalPDF } = await import('../lib/pdfGenerator.jsx')
                  const { docxGenerator } = await import('../lib/docxGenerator')
                  
                  // Export Resume
                  await generateTraditionalPDF(resumeContent, application.job_title, application.company_name)
                  await new Promise(resolve => setTimeout(resolve, 500))
                  
                  // Export Cover Letter
                  await docxGenerator.generateCoverLetter(
                    coverLetterText,
                    resumeContent?.personalDetails?.name || 'Candidate',
                    application.company_name,
                    application.job_title
                  )
                  await new Promise(resolve => setTimeout(resolve, 500))
                  
                  // Export Strategic Brief
                  await generateStrategicBriefPDF(
                    brief,
                    resumeContent?.personalDetails?.name || 'Candidate',
                    application.company_name,
                    application.job_title
                  )
                }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Export All Documents
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="prose max-w-none">
          {/* Analysis Tab */}
          {activeTab === 'analysis' && analysis && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Assessment</h3>
                <p className="text-gray-700">{analysis.overall_assessment}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Gaps</h3>
                  <ul className="space-y-2">
                    {analysis.gaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-yellow-600 mt-1">!</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-primary-600 mt-1">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === 'resume' && resumeContent && (
            <ResumeTemplateSelector 
              resumeContent={resumeContent}
              jobTitle={application.job_title}
              companyName={application.company_name}
            />
          )}

          {/* Cover Letter Tab */}
          {activeTab === 'cover-letter' && coverLetterText && (
            <EditableCoverLetter 
              coverLetterText={coverLetterText}
              candidateName={resumeContent?.personalDetails?.name || 'Candidate'}
              companyName={application.company_name}
              profileData={{
                personal_info: {
                  name: resumeContent?.personalDetails?.name,
                  location: resumeContent?.personalDetails?.location,
                  phone: resumeContent?.personalDetails?.phone,
                  email: resumeContent?.personalDetails?.email,
                  linkedin: resumeContent?.personalDetails?.linkedin,
                  title: resumeContent?.personalDetails?.title
                }
              }}
              jobTitle={application.job_title}
            />
          )}

          {/* Strategic Brief Tab */}
          {activeTab === 'brief' && brief && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button 
                  onClick={() => generateStrategicBriefPDF(
                    brief, 
                    resumeContent?.personalDetails?.name || 'Candidate',
                    application.company_name,
                    application.job_title
                  )}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download size={18} />
                  Export as PDF
                </button>
              </div>

              {/* Case Study */}
              {brief.case_study && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">1. Relevant Projects / Case Study</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{brief.case_study.title}</h4>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 leading-relaxed">{brief.case_study.opening_paragraph}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Vision & Value Proposition:</h5>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line">{brief.case_study.vision_and_value}</div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Anchored in Proven Results (from CV):</h5>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line">{brief.case_study.proven_results}</div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 leading-relaxed font-medium">{brief.case_study.closing_statement}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 90-Day Plan */}
              {brief.ninety_day_plan && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">2. 90-Day Plan</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {brief.ninety_day_plan.opening_statement && (
                      <p className="text-gray-600 leading-relaxed font-medium">{brief.ninety_day_plan.opening_statement}</p>
                    )}
                    
                    {brief.ninety_day_plan.phase_1 && (
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">{brief.ninety_day_plan.phase_1.title}</h4>
                        <ul className="space-y-1">
                          {brief.ninety_day_plan.phase_1.actions.map((action, i) => (
                            <li key={i} className="text-gray-600 text-sm">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {brief.ninety_day_plan.phase_2 && (
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">{brief.ninety_day_plan.phase_2.title}</h4>
                        <ul className="space-y-1">
                          {brief.ninety_day_plan.phase_2.actions.map((action, i) => (
                            <li key={i} className="text-gray-600 text-sm">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {brief.ninety_day_plan.phase_3 && (
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">{brief.ninety_day_plan.phase_3.title}</h4>
                        <ul className="space-y-1">
                          {brief.ninety_day_plan.phase_3.actions.map((action, i) => (
                            <li key={i} className="text-gray-600 text-sm">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {brief.ninety_day_plan.closing_statement && (
                      <p className="text-gray-600 leading-relaxed font-medium italic">{brief.ninety_day_plan.closing_statement}</p>
                    )}
                  </div>
                </div>
              )}

              {/* KPIs */}
              {brief.kpis && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">3. Key Performance Indicators (KPIs)</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {brief.kpis.opening_statement && (
                      <p className="text-gray-600 leading-relaxed font-medium">{brief.kpis.opening_statement}</p>
                    )}
                    
                    <div className="space-y-3">
                      {brief.kpis.metrics && brief.kpis.metrics.map((metric, i) => (
                        <div key={i} className="border-l-4 border-blue-500 pl-4">
                          <div className="font-semibold text-gray-900 mb-1">{metric.name}</div>
                          <div className="text-gray-600 text-sm leading-relaxed">{metric.description}</div>
                        </div>
                      ))}
                    </div>
                    
                    {brief.kpis.closing_statement && (
                      <p className="text-gray-600 leading-relaxed font-medium italic">{brief.kpis.closing_statement}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interview Prep Tab */}
          {activeTab === 'interview-prep' && (
            <div className="space-y-6">
              {application.drafts?.interviewPrep ? (
                <>
                  {/* Questions */}
                  {application.drafts.interviewPrep.questions && (
                    <div>
                      <h3 className="text-xl font-semibold text-blue-600 mb-4">Interview Questions & Responses</h3>
                      <div className="space-y-4">
                        {application.drafts.interviewPrep.questions.map((q, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{q.question}</h4>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{q.category}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 italic">{q.framework}</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{q.response}</p>
                            {q.keyPoints && q.keyPoints.length > 0 && (
                              <div className="mt-3 bg-green-50 p-3 rounded">
                                <p className="font-medium text-green-900 text-sm mb-1">Key Points:</p>
                                <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                                  {q.keyPoints.map((point, i) => (
                                    <li key={i}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STAR Stories */}
                  {application.drafts.interviewPrep.starStories && (
                    <div>
                      <h3 className="text-xl font-semibold text-purple-600 mb-4">STAR Stories</h3>
                      <div className="space-y-4">
                        {application.drafts.interviewPrep.starStories.map((story, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">{story.title}</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium text-blue-600">Situation:</span> {story.situation}</div>
                              <div><span className="font-medium text-green-600">Task:</span> {story.task}</div>
                              <div><span className="font-medium text-yellow-600">Action:</span> {story.action}</div>
                              <div><span className="font-medium text-purple-600">Result:</span> {story.result}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 90-Day Plan */}
                  {application.drafts.interviewPrep.ninetyDayPlan && (
                    <div>
                      <h3 className="text-xl font-semibold text-green-600 mb-4">90-Day Plan</h3>
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700">
                        {application.drafts.interviewPrep.ninetyDayPlan}
                      </div>
                    </div>
                  )}

                  {/* KPIs */}
                  {application.drafts.interviewPrep.kpis && (
                    <div>
                      <h3 className="text-xl font-semibold text-orange-600 mb-4">Key Performance Indicators</h3>
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700">
                        {application.drafts.interviewPrep.kpis}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interview Prep Yet</h3>
                  <p className="text-gray-600 mb-4">Generate interview preparation from the Mock Interview page</p>
                  <Link to="/mock-interview" className="btn-primary inline-flex items-center gap-2">
                    <MessageSquare size={18} />
                    Go to Mock Interview
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
