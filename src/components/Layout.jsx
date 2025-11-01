import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Settings, 
  LogOut,
  User,
  Search,
  Sliders,
  MessageSquare,
  Monitor
} from 'lucide-react'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    // { path: '/jobs', icon: Search, label: 'Job Discovery' }, // Hidden for manual application focus
    { path: '/profile-setup', icon: User, label: 'Profile' },
    { path: '/job-analysis', icon: Briefcase, label: 'New Application' },
    { path: '/mock-interview', icon: MessageSquare, label: 'Mock Interview' },
    { path: '/interview-buddy', icon: Monitor, label: 'Interview Buddy' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <Link to="/dashboard" className="block">
              <div className="flex items-center gap-3 mb-2">
                <div className="px-4 py-2 bg-gray-900 rounded-lg">
                  <img src="/logo.png" alt="GetNoticed" className="h-8 w-auto" />
                </div>
              </div>
              <p className="text-sm text-gray-500 ml-1">Your AI job search partner</p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              // Special handling for New Application - always reload
              if (item.path === '/job-analysis') {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      active
                        ? 'bg-gray-900 text-white font-semibold shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </a>
                )
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-gray-900 text-white font-semibold shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
