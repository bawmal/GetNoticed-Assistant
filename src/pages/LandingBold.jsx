import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Target, Users, TrendingUp, Star, CheckCircle, X } from 'lucide-react'

export default function LandingBold() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const testimonials = [
    {
      text: "I went from 0 interviews to 3 job offers in 2 weeks. This is insane.",
      author: "Sarah Chen",
      role: "Product Manager at Stripe",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
    },
    {
      text: "Finally, a tool that actually understands what hiring managers want.",
      author: "Marcus Rodriguez", 
      role: "Senior Developer at Airbnb",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      text: "My resume used to get ignored. Now I can't keep up with the responses.",
      author: "Emily Park",
      role: "Data Scientist at Google",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-black">
            <span className="text-white">GET</span>
            <span className="text-yellow-400">NOTICED</span>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
          >
            LOGIN
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-yellow-400/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Attention Grabber */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-sm mb-8 animate-bounce">
            <Zap size={16} />
            <span>STOP GETTING IGNORED</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="block">YOUR RESUME</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              SUCKS.
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl mt-4 text-gray-300">
              We'll fix it in 60 seconds.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Stop sending the same boring resume to every job. Our AI creates 
            <span className="text-yellow-400 font-bold"> personalized applications </span>
            that actually get you hired.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              to="/login" 
              className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-12 py-6 rounded-full font-black text-xl hover:shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              FIX MY RESUME NOW
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
            </Link>
            <button 
              onClick={() => setIsVideoPlaying(true)}
              className="border-2 border-white text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
            >
              WATCH IT WORK
            </button>
          </div>

          {/* Social Proof Numbers */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">47K+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Jobs Landed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">3.2x</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">More Interviews</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">89%</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              The <span className="text-red-500">BRUTAL</span> Truth
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your resume gets 6 seconds of attention. Most never make it past the ATS robots. 
              You're competing against 100+ other candidates with the same generic template.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">😴</div>
              <h3 className="text-2xl font-bold mb-4 text-red-400">BORING</h3>
              <p className="text-gray-300">Your resume looks like everyone else's. Zero personality, zero impact.</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-4 text-red-400">FILTERED OUT</h3>
              <p className="text-gray-300">ATS systems reject 75% of resumes before humans even see them.</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-2xl font-bold mb-4 text-red-400">IGNORED</h3>
              <p className="text-gray-300">Generic applications get generic responses: silence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              We <span className="text-green-400">DESTROY</span> The Competition
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="text-black" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-green-400">LASER-TARGETED</h3>
                  <p className="text-gray-300 text-lg">
                    Every resume is custom-built for the specific job. We analyze the posting and match your experience perfectly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="text-black" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-yellow-400">LIGHTNING FAST</h3>
                  <p className="text-gray-300 text-lg">
                    What takes you hours, we do in seconds. Upload your info once, generate unlimited applications.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-black" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-purple-400">PROVEN RESULTS</h3>
                  <p className="text-gray-300 text-lg">
                    Our users get 3x more interviews and land jobs 67% faster. The numbers don't lie.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Testimonial Carousel */}
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400/10 to-purple-500/10 rounded-3xl p-8 border border-yellow-400/20">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonials[currentTestimonial].image} 
                    alt={testimonials[currentTestimonial].author}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-lg">{testimonials[currentTestimonial].author}</div>
                    <div className="text-gray-400">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
                <blockquote className="text-2xl font-bold mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
              </div>
              
              {/* Carousel Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentTestimonial ? 'bg-yellow-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-black mb-8">
            STOP WASTING TIME
          </h2>
          <p className="text-xl text-black/80 mb-12 max-w-2xl mx-auto">
            Every day you wait is another day someone else gets your dream job. 
            Start getting interviews TODAY.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-3 bg-black text-white px-12 py-6 rounded-full font-black text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            GET STARTED NOW - IT'S FREE
            <ArrowRight size={24} />
          </Link>
          <p className="text-black/60 text-sm mt-4">No credit card required • 2 minute setup</p>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-yellow-400 transition-colors"
            >
              <X size={32} />
            </button>
            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold mb-4">Demo Video Coming Soon</h3>
              <p className="text-gray-300">Watch how GetNoticed transforms boring resumes into interview magnets.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
