import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { 
  Plus, 
  Briefcase, 
  TrendingUp, 
  FileText, 
  Target,
  Calendar,
  ExternalLink,
  MoreVertical,
  Check,
  X
} from 'lucide-react'

export default function Dashboard() {
  const [applications, setApplications] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviewing: 0,
    closed: 0,
    avgScore: 0
  })
  const [statusMenuOpen, setStatusMenuOpen] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load primary profile
      const profileData = await supabaseHelpers.getPrimaryProfile(user.id)
      setProfile(profileData)

      // Load applications
      const applicationsData = await supabaseHelpers.getApplications(user.id)
      setApplications(applicationsData)

      // Calculate stats
      const total = applicationsData.length
      const applied = applicationsData.filter(app => app.status === 'applied').length
      const interviewing = applicationsData.filter(app => app.status === 'interviewing').length
      const closed = applicationsData.filter(app => app.status === 'closed').length
      const avgScore = total > 0 
        ? Math.round(applicationsData.reduce((sum, app) => sum + (app.match_score || 0), 0) / total)
        : 0

      setStats({ total, applied, interviewing, closed, avgScore })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      applied: 'bg-blue-100 text-blue-700',
      interviewing: 'bg-green-100 text-green-700',
      closed: 'bg-red-100 text-red-700',
      rejected: 'bg-red-100 text-red-700',
      accepted: 'bg-purple-100 text-purple-700'
    }
    return colors[status] || colors.draft
  }

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await supabaseHelpers.updateApplication(appId, { status: newStatus })
      // Reload dashboard data to update stats and list
      await loadDashboardData()
      setStatusMenuOpen(null)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900">Dashboard</h1>
          <p className="text-xl text-gray-600 mt-3">
            {profile ? `Welcome back, ${profile.profile_name}!` : 'Track your job applications'}
          </p>
        </div>
        <Link to="/job-analysis" className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all hover:shadow-lg flex items-center gap-2 justify-center">
          <Plus size={20} />
          New Application
        </Link>
      </div>

      {/* Profile Section */}
      {profile ? (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="text-gray-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.profile_name}
                </h3>
                <p className="text-sm text-gray-500">
                  Primary Profile
                </p>
              </div>
            </div>
            <Link 
              to="/profile-setup" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Set Up Your Profile
                </h3>
                <p className="text-sm text-gray-500">
                  Upload your CV to get started
                </p>
              </div>
            </div>
            <Link 
              to="/profile-setup" 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Profile
            </Link>
          </div>
        </div>
      )}

      {/* Modern Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Breakdown - Large Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Application Pipeline</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
          
          {/* Progress Bar Breakdown */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900">{stats.total} Total</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              {stats.applied > 0 && (
                <div 
                  className="bg-blue-500 h-full transition-all" 
                  style={{ width: `${(stats.applied / stats.total) * 100}%` }}
                  title={`${stats.applied} Applied`}
                />
              )}
              {stats.interviewing > 0 && (
                <div 
                  className="bg-green-500 h-full transition-all" 
                  style={{ width: `${(stats.interviewing / stats.total) * 100}%` }}
                  title={`${stats.interviewing} Interviewing`}
                />
              )}
              {stats.closed > 0 && (
                <div 
                  className="bg-red-500 h-full transition-all" 
                  style={{ width: `${(stats.closed / stats.total) * 100}%` }}
                  title={`${stats.closed} Closed`}
                />
              )}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-semibold text-gray-600 uppercase">Applied</span>
              </div>
              <div className="text-3xl font-black text-blue-600">{stats.applied}</div>
              <div className="text-xs text-gray-500 mt-1">Submitted</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs font-semibold text-gray-600 uppercase">Interviewing</span>
              </div>
              <div className="text-3xl font-black text-green-600">{stats.interviewing}</div>
              <div className="text-xs text-gray-500 mt-1">In Progress</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs font-semibold text-gray-600 uppercase">Closed</span>
              </div>
              <div className="text-3xl font-black text-red-600">{stats.closed}</div>
              <div className="text-xs text-gray-500 mt-1">Not Moving Forward</div>
            </div>
          </div>
        </div>

        {/* Match Score Card - Gradient */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Average Match</h3>
            <Target className="opacity-75" size={20} />
          </div>
          
          {/* Circular Progress */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.avgScore / 100)}`}
                className="opacity-100"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-black">{stats.avgScore}%</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm opacity-90">Across {stats.total} applications</div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link to="/applications" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            View All
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Briefcase className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="text-base font-medium text-gray-900 mb-1">No applications yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start by analyzing a job posting
            </p>
            <Link to="/job-analysis" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus size={16} />
              New Application
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <Link to={`/application/${app.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{app.job_title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(app.status)} flex-shrink-0`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600">{app.company_name}</p>
                      {app.match_score && (
                        <span className="text-xs text-gray-500">
                          {app.match_score}% match
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} className="text-gray-400" />
                      </a>
                    )}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatusMenuOpen(statusMenuOpen === app.id ? null : app.id)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      {statusMenuOpen === app.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(app.id, 'applied')
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Applied
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(app.id, 'interviewing')
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Interviewing
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(app.id, 'closed')
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Closed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
