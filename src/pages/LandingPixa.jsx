import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, ChevronDown } from 'lucide-react'

export default function LandingPixa() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-900">GetNoticed</div>
          <Link to="/login" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          All your career tools in one place
        </h1>
        <Link to="/login" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-medium mb-8">
          Get started
        </Link>
        
        <div className="text-sm text-gray-600 mb-8">+20,000</div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="bg-gray-100 px-4 py-2 rounded text-sm">Resume generator</div>
          <div className="bg-gray-100 px-4 py-2 rounded text-sm">Cover letter generator</div>
          <div className="bg-gray-100 px-4 py-2 rounded text-sm">Job analyzer</div>
          <div className="text-gray-500 text-sm">Show all</div>
        </div>
        
        <Link to="/login" className="bg-gray-900 text-white px-4 py-2 rounded text-sm">
          Signup
        </Link>
      </section>

      {/* AI Models */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Try AI Models</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['GPT 4o', 'Gemini', 'Llama 3', 'Claude'].map((model) => (
            <div key={model} className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="font-medium">{model}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Experience all the benefits of AI</h2>
        
        <div className="space-y-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-4">Unified interface</h3>
              <p className="text-gray-600 mb-4">
                Our's is the only unified AI career tool brings together all your job search needs into one seamless platform. 
                No more juggling between different tools—easily manage resumes, applications, and analytics from a single interface.
              </p>
              <button className="text-blue-600 font-medium">Learn more</button>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 h-48"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-gray-50 rounded-lg p-8 h-48 md:order-first"></div>
            <div>
              <h3 className="text-xl font-semibold mb-4">ATS Optimization</h3>
              <p className="text-gray-600 mb-4">
                GetNoticed's AI offers advanced resume optimization, cover letter generation, and job matching. 
                Easily integrate with support for multiple formats, enhancing your applications with powerful career tools.
              </p>
              <button className="text-blue-600 font-medium">Learn more</button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Pre-built Career Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'AI Resume Builder', desc: 'AI generates resumes for each job application, based on your skills and experience.' },
            { title: 'Cover Letter Generator', desc: 'AI generates cover letters for each job application, increasing your chances of getting hired.' },
            { title: 'Job Fit Analysis', desc: 'Get instant match scores and detailed analysis for any job posting automatically.' },
            { title: '90-Day Strategic Plans', desc: 'Stand out with strategic plans showing exactly how you\'ll add value in your first 90 days.' },
            { title: 'Application Analytics', desc: 'Our AI analytics tools analyze application patterns and trends, providing actionable insights.' },
            { title: 'Multiple Career Profiles', desc: 'Manage different career profiles (Developer, Manager, etc.) in one place for different roles.' }
          ].map((tool, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">{tool.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{tool.desc}</p>
              <div className="bg-gray-50 rounded p-4 mb-4 h-24"></div>
              <button className="w-full bg-gray-900 text-white py-2 rounded text-sm">Learn more</button>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">One Subscription for it all</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">$9 /mo</h3>
            <p className="text-gray-600 text-sm mb-4">Essential career tools for everyday use</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li>• 50 AI powered applications</li>
              <li>• 10 premium resume templates</li>
              <li>• Basic job fit analysis</li>
              <li>• Access to all AI models</li>
              <li>• Early access to new features</li>
            </ul>
            <button className="w-full bg-gray-900 text-white py-2 rounded text-sm">Choose plan</button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">$17 /mo</h3>
            <p className="text-gray-600 text-sm mb-4">Advanced features for serious job seekers</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li>• 200 AI powered applications</li>
              <li>• 25 premium resume templates</li>
              <li>• Advanced job fit analysis</li>
              <li>• Access to all AI models</li>
              <li>• Early access to new features</li>
            </ul>
            <button className="w-full bg-gray-900 text-white py-2 rounded text-sm">Choose plan</button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">$29 /mo</h3>
            <p className="text-gray-600 text-sm mb-4">Unlimited potential for power users</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li>• Unlimited AI applications</li>
              <li>• All premium templates</li>
              <li>• Advanced analytics</li>
              <li>• Access to all AI models</li>
              <li>• Priority support</li>
            </ul>
            <button className="w-full bg-gray-900 text-white py-2 rounded text-sm">Choose plan</button>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Read resources by experts ✨</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Career Tips</h3>
            <p className="text-gray-500 text-sm mb-2">Dec, 15, 2024</p>
            <p className="text-gray-600">How to optimize your resume for ATS systems</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Announcement</h3>
            <p className="text-gray-500 text-sm mb-2">Nov, 28, 2024</p>
            <p className="text-gray-600">GetNoticed launches advanced job matching</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Industry Insights</h3>
            <p className="text-gray-500 text-sm mb-2">Oct, 22, 2024</p>
            <p className="text-gray-600">The future of AI in career development</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "What's GetNoticed?", a: "GetNoticed is an AI-powered career assistant that helps you create tailored resumes, cover letters, and job applications." },
            { q: "How does the AI work?", a: "Our AI analyzes job descriptions and your experience to create personalized applications that match what employers are looking for." },
            { q: "Is GetNoticed free to use?", a: "We offer a free tier with basic features. Premium plans unlock unlimited applications and advanced features." },
            { q: "What file formats are supported?", a: "We support PDF, Word, and plain text formats for both input and output documents." }
          ].map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-lg">
              <button 
                className="w-full p-4 text-left font-medium flex justify-between items-center"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <ChevronDown className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`} size={20} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-gray-600">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access and compare multiple AI models</h2>
        <Link to="/login" className="bg-gray-900 text-white px-6 py-3 rounded font-medium">
          Launch GetNoticed
        </Link>
      </section>
    </div>
  )
}
