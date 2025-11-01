import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, ChevronDown, Sparkles } from 'lucide-react'

export default function LandingModern() {
  const [openFaq, setOpenFaq] = useState(null)
  const [activeModel, setActiveModel] = useState(0)
  const [activeFeature, setActiveFeature] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const rotatingFeatures = [
    "How to optimize your resume for ATS",
    "What's the best cover letter format?",
    "How to create a 90-day strategic plan",
    "Tips for job interview preparation",
    "How to track application analytics"
  ]

  useEffect(() => {
    const currentText = rotatingFeatures[activeFeature]
    const words = currentText.split(' ')
    let wordIndex = 0
    
    setDisplayedText('')
    setIsTyping(true)
    
    // Type out words one by one
    const typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayedText(words.slice(0, wordIndex + 1).join(' '))
        wordIndex++
      } else {
        clearInterval(typingInterval)
        // Wait 1 second, then fade out
        setTimeout(() => {
          setIsTyping(false)
          // Wait for fade out, then move to next feature
          setTimeout(() => {
            setActiveFeature((prev) => (prev + 1) % rotatingFeatures.length)
          }, 500)
        }, 1000)
      }
    }, 200) // Type each word every 200ms
    
    return () => clearInterval(typingInterval)
  }, [activeFeature])

  const aiModels = [
    { name: 'GPT-4o', description: 'OpenAI\'s latest', color: 'bg-green-500' },
    { name: 'Gemini 2.0', description: 'Google\'s newest', color: 'bg-blue-500' },
    { name: 'Claude 4', description: 'Anthropic\'s best', color: 'bg-purple-500' },
    { name: 'Llama 3.3', description: 'Meta\'s latest', color: 'bg-orange-500' }
  ]

  const tools = [
    {
      title: 'AI Resume Builder',
      description: 'AI generates resumes for each job application, based on your skills and experience.',
      icon: 'https://api.iconify.design/mdi/file-document-edit.svg?color=%239ca3af&width=64'
    },
    {
      title: 'Cover Letter Generator', 
      description: 'AI generates cover letters for each job application, increasing your chances of getting hired.',
      icon: 'https://api.iconify.design/mdi/email-edit.svg?color=%239ca3af&width=64'
    },
    {
      title: 'Job Fit Analysis',
      description: 'Get instant match scores and detailed analysis for any job posting automatically.',
      icon: 'https://api.iconify.design/mdi/chart-box.svg?color=%239ca3af&width=64'
    },
    {
      title: '90-Day Strategic Plans',
      description: 'Stand out with strategic plans showing exactly how you\'ll add value in your first 90 days.',
      icon: 'https://api.iconify.design/mdi/calendar-check.svg?color=%239ca3af&width=64'
    },
    {
      title: 'Application Analytics',
      description: 'Our AI analytics tools analyze application patterns and trends, providing actionable insights.',
      icon: 'https://api.iconify.design/mdi/chart-line.svg?color=%239ca3af&width=64'
    },
    {
      title: 'Multiple Career Profiles',
      description: 'Manage different career profiles (Developer, Manager, etc.) in one place for different roles.',
      icon: 'https://api.iconify.design/mdi/account-multiple.svg?color=%239ca3af&width=64'
    }
  ]

  const features = [
    {
      title: 'Unified Interface',
      description: 'Our\'s is the only unified AI career tool that brings together all your job search needs into one seamless platform. No more juggling between different tools—easily manage resumes, applications, and analytics from a single interface.'
    },
    {
      title: 'ATS Optimization',
      description: 'GetNoticed\'s AI offers advanced resume optimization, cover letter generation, and job matching. Easily integrate with support for multiple formats, enhancing your applications with powerful career tools.'
    },
    {
      title: 'Pre-built Templates',
      description: 'GetNoticed offers pre-built resume templates for diverse career paths including technical, management, creative, and executive roles, simplifying professional presentation.'
    },
    {
      title: 'Multiple AI Models',
      description: 'GetNoticed supports various AI models, including ChatGPT, Gemini, Claude, and more, providing a range of advanced capabilities for various career and application tasks.'
    }
  ]

  const resources = [
    {
      title: 'How to optimize your resume for ATS systems',
      category: 'Career Tips',
      date: 'Dec 15, 2024'
    },
    {
      title: 'GetNoticed launches advanced job matching',
      category: 'Announcement', 
      date: 'Nov 28, 2024'
    },
    {
      title: 'The future of AI in career development',
      category: 'Industry Insights',
      date: 'Oct 22, 2024'
    }
  ]

  const faqs = [
    {
      question: 'What\'s GetNoticed?',
      answer: 'GetNoticed is an AI-powered career assistant that helps you create tailored resumes, cover letters, and job applications to increase your chances of getting hired.'
    },
    {
      question: 'How does the AI work?',
      answer: 'Our AI analyzes job descriptions and your experience to create personalized applications that match what employers are looking for.'
    },
    {
      question: 'Is GetNoticed free to use?',
      answer: 'We offer a free tier with basic features. Premium plans unlock unlimited applications and advanced features.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, Word, and plain text formats for both input and output documents.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Sticky with Gap */}
      <div className="sticky top-0 z-50 pt-4 px-6 bg-white">
        <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <div className="px-4 py-2 bg-gray-900 rounded-lg">
                <img src="/logo.png" alt="GetNoticed" className="h-8 w-auto" />
              </div>
            </Link>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
                <a href="#journey" className="hover:text-gray-900 transition-colors">Journey</a>
                <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              </div>
              <Link 
                to="/login" 
                className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                Try AI Assistant <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section with Dotted Background */}
      <section className="relative py-20 px-6 overflow-hidden" style={{
        backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}>
        {/* Gradient Overlay Blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-cyan-200/40 to-blue-200/40 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Powered by Advanced AI Models</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            ALL YOUR CAREER TOOLS<br />IN ONE PLACE
          </h1>
          
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            One click. Perfect match.
          </p>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Generate resumes, cover letters, and strategic plans with AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Get started <ArrowRight size={18} />
            </Link>
            <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
              Watch video
            </button>
          </div>
          
          {/* Social Proof Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-16">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white"></div>
            </div>
            <span className="font-medium">Join 10,000+ job seekers landing their dream roles</span>
          </div>

          {/* AI Models Showcase */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-6">Powered by Multiple AI Models</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  activeModel === 0 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveModel(0)}
              >
                <div className="w-10 h-10 mb-3 flex items-center justify-center">
                  <img src="https://api.iconify.design/simple-icons/openai.svg?color=%2310a37f" alt="GPT-4o" className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">GPT-4o</h4>
                <p className="text-xs text-gray-500">OpenAI's latest</p>
              </div>
              
              <div 
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  activeModel === 1 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveModel(1)}
              >
                <div className="w-10 h-10 mb-3 flex items-center justify-center">
                  <img src="https://api.iconify.design/simple-icons/google.svg?color=%234285f4" alt="Gemini 2.0" className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Gemini 2.0</h4>
                <p className="text-xs text-gray-500">Google's newest</p>
              </div>
              
              <div 
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  activeModel === 2 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveModel(2)}
              >
                <div className="w-10 h-10 mb-3 flex items-center justify-center">
                  <img src="https://api.iconify.design/simple-icons/anthropic.svg?color=%23000000" alt="Claude 4" className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Claude 4</h4>
                <p className="text-xs text-gray-500">Anthropic's best</p>
              </div>
              
              <div 
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  activeModel === 3 
                    ? 'border-orange-400 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveModel(3)}
              >
                <div className="w-10 h-10 mb-3 flex items-center justify-center">
                  <img src="https://api.iconify.design/simple-icons/meta.svg?color=%230467df" alt="Llama 3.3" className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Llama 3.3</h4>
                <p className="text-xs text-gray-500">Meta's latest</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try Features - Enhanced */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-[300px,1fr] min-h-[600px]">
              {/* Left Sidebar - Pixa Style */}
              <div className="bg-gray-50 p-6 border-r border-gray-200 flex flex-col">
                <div className="mb-6">
                  <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer py-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Resume builder</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer py-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Cover letter</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer py-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Job analyzer</span>
                  </div>
                  <div className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer mt-3">
                    Show all →
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Powered by</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <img src="https://api.iconify.design/simple-icons/openai.svg?color=%2310a37f" alt="ChatGPT" className="w-5 h-5" title="ChatGPT" />
                      <img src="https://api.iconify.design/simple-icons/google.svg?color=%234285f4" alt="Gemini" className="w-5 h-5" title="Gemini" />
                      <img src="https://api.iconify.design/simple-icons/anthropic.svg?color=%23000000" alt="Claude" className="w-5 h-5" title="Claude" />
                      <img src="https://api.iconify.design/simple-icons/meta.svg?color=%230467df" alt="Llama" className="w-5 h-5" title="Llama" />
                    </div>
                  </div>
                  <button className="w-full py-2 border border-gray-300 rounded text-xs font-medium hover:bg-gray-100 transition-colors">
                    Signup
                  </button>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="p-16 flex flex-col items-center justify-center">
                {/* Rotating Text - Typewriter Effect */}
                <div className="text-center mb-16 min-h-[200px] flex items-center justify-center">
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 max-w-3xl leading-tight transition-opacity duration-500 ${isTyping ? 'opacity-100' : 'opacity-0'}`}>
                    {displayedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </h1>
                </div>
                
                {/* Visual Mockup - Resume Preview */}
                <div className="w-full max-w-md bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg transition-all duration-500">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="border-b-2 border-gray-900 pb-3">
                      <div className="h-6 bg-gray-900 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    
                    {/* Content Lines */}
                    <div className="space-y-3 pt-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    
                    {/* Section */}
                    <div className="pt-4 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-2/5 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  
                  {/* AI Badge */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="text-white" size={12} />
                    </div>
                    <span className="text-xs text-gray-500">AI Generated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Journey - Scroll Effect */}
      <section id="journey" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left - Sticky Title */}
            <div className="lg:sticky lg:top-32">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Application Journey
              </h2>
              <p className="text-gray-600 mb-8">
                From discovery to offer - we guide you through every step of landing your dream job.
              </p>
              <Link 
                to="/login"
                className="inline-block px-6 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors"
              >
                Start Journey
              </Link>
            </div>

            {/* Right - Scrolling Content */}
            <div className="space-y-16">
              {/* Stage 1 */}
              <div className="border-l-2 border-gray-200 pl-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Job Discovery</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  AI-powered job matching finds opportunities that align with your skills, experience, and career goals. Get personalized recommendations from thousands of listings.
                </p>
                <a href="#" className="text-sm text-gray-900 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ArrowRight size={16} />
                </a>
              </div>

              {/* Stage 2 */}
              <div className="border-l-2 border-gray-200 pl-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Resume Generation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Generate ATS-optimized resumes tailored to each job. Our AI analyzes job descriptions and highlights your most relevant experience and skills.
                </p>
                <a href="#" className="text-sm text-gray-900 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ArrowRight size={16} />
                </a>
              </div>

              {/* Stage 3 */}
              <div className="border-l-2 border-gray-200 pl-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Cover Letter & Strategy</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Create compelling cover letters and 90-day strategic plans that demonstrate your value. Stand out from other candidates with personalized content.
                </p>
                <a href="#" className="text-sm text-gray-900 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ArrowRight size={16} />
                </a>
              </div>

              {/* Stage 4 */}
              <div className="border-l-2 border-gray-200 pl-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Application Tracking</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Track all your applications in one place. Get insights on response rates, follow-up reminders, and analytics to optimize your job search strategy.
                </p>
                <a href="#" className="text-sm text-gray-900 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ArrowRight size={16} />
                </a>
              </div>

              {/* Stage 5 */}
              <div className="border-l-2 border-gray-200 pl-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Interview Preparation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Practice with AI-generated interview questions specific to your role and company. Get feedback and build confidence before the big day.
                </p>
                <a href="#" className="text-sm text-gray-900 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ArrowRight size={16} />
                </a>
              </div>

              {/* Stage 6 - Coming Soon */}
              <div className="border-l-2 border-gray-200 pl-8 opacity-60">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500 font-bold">6</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Interview Buddy</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Coming Soon</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Real-time AI interview companion that listens to your interviews and provides live suggestions, answers, and confidence boosters during the call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Exact Pixa Match */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              One Subscription for it all
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">$9 <span className="text-base font-normal text-gray-600">/mo</span></div>
                <p className="text-sm text-gray-600 mt-2">Essential career tools for everyday use</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>50 AI powered applications</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>10 premium resume templates</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Basic job fit analysis</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Access to all AI models</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Early access to new features</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Choose plan
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">$17 <span className="text-base font-normal text-gray-600">/mo</span></div>
                <p className="text-sm text-gray-600 mt-2">Advanced features for serious job seekers</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>200 AI powered applications</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>25 premium resume templates</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Advanced job fit analysis</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Access to all AI models</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Early access to new features</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Choose plan
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">$29 <span className="text-base font-normal text-gray-600">/mo</span></div>
                <p className="text-sm text-gray-600 mt-2">Unlimited potential for power users</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Unlimited AI applications</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>All premium templates</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Access to all AI models</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="mr-3 mt-0.5">•</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Choose plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Pixa Style */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Logo */}
            <div>
              <Link to="/" className="inline-block">
                <div className="px-4 py-2 bg-gray-900 rounded-lg mb-4">
                  <img src="/logo.png" alt="GetNoticed" className="h-6 w-auto" />
                </div>
              </Link>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Career Tips</a></li>
                <li><a href="#" className="hover:text-gray-900">Resume Templates</a></li>
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900">Partners</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 GetNoticed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
