import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Target, FileText, Briefcase, TrendingUp, Zap, ArrowRight } from 'lucide-react'

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
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Sparkles size={16} className="text-gray-600" />
          <span className="text-gray-700">Powered by Gemini AI</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8">
          Weeks of applying.
          <br />
          <span className="relative inline-block w-full min-h-[80px] sm:min-h-[100px]">
            {rotatingTexts.map((text, index) => (
              <span
                key={text}
                className={`absolute left-0 right-0 flex items-center justify-center text-gray-900 transition-all duration-500 ${
                  index === currentText
                    ? 'opacity-100 translate-y-0'
                    : index < currentText
                    ? 'opacity-0 -translate-y-12'
                    : 'opacity-0 translate-y-12'
                }`}
              >
                Done in {text === 'Career Assistant' ? 'minutes' : text === 'Job Search Partner' ? 'seconds' : text === 'Application Generator' ? 'clicks' : 'moments'}.
              </span>
            ))}
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Transform your job search with AI. Generate tailored resumes, strategic briefs, 
          and stand-out applications in <span className="font-semibold text-gray-900">minutes, not hours</span>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            to="/login" 
            className="group px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            Get Started Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg font-semibold text-lg transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Social Proof */}
        <div className="bg-gray-50 rounded-2xl p-8 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              You are 3x more likely to get hired faster with GetNoticed
            </p>
            <p className="text-gray-600">Join 10,000+ professionals landing their dream jobs</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900 mb-1">10x</div>
              <div className="text-xs text-gray-600">Faster</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900 mb-1">95%</div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900 mb-1">3x</div>
              <div className="text-xs text-gray-600">Interviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Resume Preview */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Resume Mockup */}
            <div className="order-2 lg:order-1">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                {/* Resume Header */}
                <div className="border-b-2 border-gray-900 pb-4 mb-6">
                  <h3 className="text-3xl font-black text-gray-900 mb-1">John Doe</h3>
                  <p className="text-gray-600 font-medium">Senior Product Manager</p>
                  <p className="text-sm text-gray-500 mt-2">San Francisco, CA • john@example.com • (555) 123-4567</p>
                </div>
                
                {/* Professional Summary */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Professional Summary</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative solutions...
                  </p>
                </div>
                
                {/* Experience Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Experience</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">Senior Product Manager</p>
                          <p className="text-sm text-gray-600">Tech Company Inc.</p>
                        </div>
                        <p className="text-xs text-gray-500">2020 - Present</p>
                      </div>
                      <ul className="space-y-1">
                        <li className="text-sm text-gray-700 flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          <span>Led product strategy for $50M revenue product line</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          <span>Increased user engagement by 150% through data-driven decisions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Skills Preview */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Product Strategy</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Agile/Scrum</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Data Analysis</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Leadership</span>
                  </div>
                </div>
                
                {/* AI Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Sparkles size={14} className="text-gray-400" />
                    <span>Generated by AI in 30 seconds</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Description */}
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                ATS-Optimized Resumes in Seconds
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our AI analyzes job descriptions and generates perfectly tailored resumes that pass ATS systems and impress hiring managers.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">ATS-Friendly Format</p>
                    <p className="text-gray-600 text-sm">Optimized to pass applicant tracking systems</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Keyword Optimization</p>
                    <p className="text-gray-600 text-sm">Matches job requirements automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Multiple Templates</p>
                    <p className="text-gray-600 text-sm">Choose from 4 professional designs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Cards/Features - AIApply Style */}
      <div id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              You are 80% more likely to get hired if you use GetNoticed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Resume Builder */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Resume Builder</h3>
              <p className="text-gray-600 mb-6">
                AI generates resumes for each job application, based on your skills and experience.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-gray-100 rounded"></div>
                    <div className="h-1.5 bg-gray-100 rounded"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                Generate Resume →
              </button>
            </div>

            {/* AI Cover Letter */}
            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Cover Letter</h3>
              <p className="text-gray-600 mb-6">
                AI generates cover letters for each job application, increasing your chances of getting hired.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Cover Letter</div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                    <div className="h-2 bg-gray-100 rounded w-4/5"></div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">
                Create Cover Letter →
              </button>
            </div>

            {/* Job Fit Analysis */}
            <div className="group bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border-2 border-violet-100 hover:border-violet-300 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Job Fit Analysis</h3>
              <p className="text-gray-600 mb-6">
                Get instant match scores and detailed analysis for any job posting automatically.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-violet-100">
                <div className="text-center mb-4">
                  <div className="text-4xl font-black text-violet-600">92%</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Match Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors">
                Analyze Job →
              </button>
            </div>

            {/* 90-Day Plans */}
            <div className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border-2 border-amber-100 hover:border-amber-300 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">90-Day Plans</h3>
              <p className="text-gray-600 mb-6">
                Stand out with strategic plans showing exactly how you'll add value in your first 90 days.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">2</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs">3</div>
                    <div className="flex-1 h-2 bg-gray-50 rounded"></div>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors">
                Create Plan →
              </button>
            </div>

            {/* Interview Practice */}
            <div className="group bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border-2 border-rose-100 hover:border-rose-300 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Interview Practice</h3>
              <p className="text-gray-600 mb-6">
                Practice with AI-generated interview questions to gain valuable insights and confidence.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase">Question 1/10</div>
                  <div className="text-sm font-semibold text-gray-900">
                    "Tell me about a time when..."
                  </div>
                  <div className="pt-2 space-y-1.5">
                    <div className="h-1.5 bg-gray-100 rounded"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors">
                Start Practice →
              </button>
            </div>

            {/* Multiple Profiles */}
            <div className="group bg-gradient-to-br from-cyan-50 to-sky-50 rounded-3xl p-8 border-2 border-cyan-100 hover:border-cyan-300 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Multiple Profiles</h3>
              <p className="text-gray-600 mb-6">
                Manage different career profiles (Developer, Manager, etc.) in one place for different roles.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl">
                    <div className="w-8 h-8 bg-cyan-600 rounded-lg"></div>
                    <span className="text-sm font-semibold">Developer</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg"></div>
                    <span className="text-sm font-semibold">Manager</span>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors">
                Add Profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center bg-gray-900 rounded-3xl p-16">
          <h2 className="text-4xl font-black mb-4 text-white">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals landing their dream jobs with AI
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-10 py-5 rounded-xl hover:bg-gray-100 transition-all"
          >
            Start Free Today
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-gray-900 rounded-lg">
                <img src="/logo.png" alt="GetNoticed" className="h-6 w-auto object-contain" />
              </div>
            </div>
            <p className="text-gray-600 text-sm text-center md:text-left">
              &copy; 2025 AI Career Assistant. Powered by GetNoticed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
