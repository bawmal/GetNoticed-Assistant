import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Target, FileText, Briefcase, TrendingUp, Zap, ArrowRight, CheckCircle, Star, Users } from 'lucide-react'

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
    }, 3000)

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

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'Tech Startup',
      image: '👩‍💼',
      quote: 'Landed 3 interviews in my first week! The tailored resumes made all the difference.'
    },
    {
      name: 'Marcus Johnson',
      role: 'Software Engineer',
      company: 'Fortune 500',
      image: '👨‍💻',
      quote: 'Cut my application time from hours to minutes. The AI analysis is incredibly accurate.'
    },
    {
      name: 'Priya Patel',
      role: 'Marketing Director',
      company: 'SaaS Company',
      image: '👩‍🎨',
      quote: 'The strategic briefs helped me stand out. Got my dream job in 2 weeks!'
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gray-900 rounded-lg">
              <img src="/logo.png" alt="GetNoticed" className="h-8 w-auto object-contain" />
            </div>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section - Two Column */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Sparkles size={16} className="text-primary-400" />
              <span className="text-gray-200">Powered by Gemini AI</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Your AI-Powered
              <br />
              <span className="relative inline-block w-full min-h-[100px] sm:min-h-[120px]">
                {rotatingTexts.map((text, index) => (
                  <span
                    key={text}
                    className={`absolute left-0 lg:left-0 right-0 flex items-center justify-center lg:justify-start bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent animate-gradient transition-all duration-500 ${
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
            
            <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Transform your job search with AI. Generate tailored resumes, strategic briefs, 
              and stand-out applications in <span className="text-primary-400 font-semibold">minutes, not hours</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link 
                to="/login" 
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all hover:scale-105"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right: App Preview Mockup */}
          <div className="relative order-first lg:order-last">
            <div className="relative">
              {/* Main App Window */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
                {/* Window Header */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-400">Job Analysis</div>
                </div>
                
                {/* Match Score Display */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 mb-4">
                  <div className="text-center">
                    <div className="text-6xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                      92%
                    </div>
                    <div className="text-sm text-gray-300">Match Score</div>
                  </div>
                </div>

                {/* Skills Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <div className="flex-1">
                      <div className="h-2 bg-green-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">90%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-blue-400" size={20} />
                    <div className="flex-1">
                      <div className="h-2 bg-blue-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">85%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-purple-400" size={20} />
                    <div className="flex-1">
                      <div className="h-2 bg-purple-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">95%</span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
                  Generate Documents →
                </button>
              </div>

              {/* Floating Success Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-green-400">95%</div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Floating Documents Badge */}
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-sm border border-primary-500/30 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary-400" size={20} />
                  <div>
                    <div className="text-2xl font-bold">1.2k+</div>
                    <div className="text-xs text-gray-400">Documents</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black mb-4">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
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

      {/* Testimonials Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black mb-4">
            Loved by Job Seekers Everywhere
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            See what our users are saying
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                  <div className="text-xs text-gray-500">{testimonial.company}</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden p-8 sm:p-16 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 backdrop-blur-sm border border-white/20 rounded-3xl text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 animate-gradient"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-display font-black mb-4">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals landing their dream jobs with AI
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-10 py-5 rounded-xl hover:scale-105 transition-all shadow-2xl hover:shadow-white/20"
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
