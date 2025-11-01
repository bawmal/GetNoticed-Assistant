import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Target, FileText, Briefcase, TrendingUp, Zap, ArrowRight, CheckCircle } from 'lucide-react'

export default function Landing() {
  const [currentText, setCurrentText] = useState(0)
  const rotatingTexts = [
    'Career Assistant',
    'Job Search Partner',
    'Application Generator',
    'Interview Accelerator'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % rotatingTexts.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])
  const features = [
    {
      icon: FileText,
      title: 'Smart CV Parsing',
      description: 'Upload your CV once and let AI extract and structure your experience for reuse.'
    },
    {
      icon: Target,
      title: 'Job Fit Analysis',
      description: 'Get instant match scores and detailed analysis for any job posting.'
    },
    {
      icon: Briefcase,
      title: 'Tailored Applications',
      description: 'Generate customized resumes, cover letters, and strategic briefs for each role.'
    },
    {
      icon: TrendingUp,
      title: '90-Day Plans',
      description: 'Stand out with strategic plans showing exactly how you\'ll add value.'
    },
    {
      icon: Zap,
      title: 'Fast Generation',
      description: 'Powered by Gemini AI for lightning-fast, high-quality outputs.'
    },
    {
      icon: Sparkles,
      title: 'Multiple Profiles',
      description: 'Manage different career profiles (Developer, Manager, etc.) in one place.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GetNoticed" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <Link 
            to="/login" 
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg font-medium transition-all hover:scale-105 text-sm sm:text-base"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Sparkles size={16} className="text-primary-400" />
            <span className="text-gray-200">Powered by Gemini AI</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black mb-6 animate-fade-in min-h-[160px] sm:min-h-[180px] md:min-h-[200px]" style={{ animationDelay: '0.1s' }}>
            Your AI-Powered
            <br />
            <span className="relative inline-block w-full" style={{ minHeight: '80px' }}>
              {rotatingTexts.map((text, index) => (
                <span
                  key={text}
                  className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent animate-gradient transition-all duration-500 ${
                    index === currentText
                      ? 'opacity-100 translate-y-0'
                      : index < currentText
                      ? 'opacity-0 -translate-y-12'
                      : 'opacity-0 translate-y-12'
                  }`}
                >
                  {text}
                </span>
              ))}
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
            Transform your job search with AI. Generate tailored resumes, strategic briefs, 
            and stand-out applications in <span className="text-primary-400 font-semibold">minutes, not hours</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
            <Link 
              to="/login" 
              className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/20 transition-all hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:scale-105">
            <div className="text-4xl sm:text-5xl font-display font-black bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">10x</div>
            <div className="text-sm sm:text-base text-gray-300 font-medium">Faster Applications</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:scale-105">
            <div className="text-4xl sm:text-5xl font-display font-black bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">95%</div>
            <div className="text-sm sm:text-base text-gray-300 font-medium">Match Accuracy</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:scale-105">
            <div className="text-4xl sm:text-5xl font-display font-black bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">3x</div>
            <div className="text-sm sm:text-base text-gray-300 font-medium">More Interviews</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black mb-4 px-4">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4">
            Comprehensive tools powered by advanced AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-primary-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="text-primary-400" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="relative overflow-hidden p-8 sm:p-12 md:p-16 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 backdrop-blur-sm border border-white/20 rounded-2xl sm:rounded-3xl text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 animate-gradient"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black mb-4 px-4">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of professionals landing their dream jobs with AI
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-xl hover:scale-105 transition-all shadow-2xl hover:shadow-white/20"
            >
              Start Free Today
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GetNoticed" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; 2025 AI Career Assistant. Powered by GetNoticed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
