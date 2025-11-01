import { useState } from 'react';
import { Download, Play, AlertCircle, Monitor, Mic, Zap } from 'lucide-react';

export default function InterviewBuddy() {
  const [showVideo, setShowVideo] = useState(false);

  const handleDownload = (platform) => {
    if (platform === 'mac') {
      // Direct download link - you'll need to upload the ZIP to your hosting
      window.location.href = '/downloads/GetNoticed-Interview-Assistant-Mac.zip';
    } else if (platform === 'windows') {
      alert('Windows version coming soon! Currently building.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            GetNoticed <span className="text-blue-600">Interview Assistant</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get real-time assistance during job interviews with our desktop app. Helping you answer questions confidently, invisible to screen-sharing & listens to the interviewer on the go.
          </p>
        </div>

        {/* Video Preview Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
          <div className="relative aspect-video bg-gradient-to-br from-purple-900 via-blue-900 to-black rounded-2xl overflow-hidden">
            {!showVideo ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 cursor-pointer hover:bg-blue-700 transition-all transform hover:scale-110"
                    onClick={() => setShowVideo(true)}
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <h2 className="text-6xl font-black text-white mb-4">
                    GetNoticed <span className="text-blue-400">Interview Assistant</span>
                  </h2>
                  <p className="text-blue-200 text-lg">Click to see how it works</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <p className="text-white">Demo video would play here</p>
              </div>
            )}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <button
            onClick={() => handleDownload('mac')}
            className="w-full max-w-md px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <Download size={24} />
            Download for macOS
          </button>
          <button
            onClick={() => handleDownload('windows')}
            className="w-full max-w-md px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
          >
            <Download size={24} />
            Download for Windows
          </button>
        </div>

        {/* Brief Instructions */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-600 font-medium">Brief Instructions</p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Important: The desktop app only detects audio from the interviewer, not your microphone.</h3>
              <p className="text-gray-700">
                If you're feeling alone, the app won't pick up any audio - it doesn't mean it's broken! The app works perfectly during actual interviews when someone else is speaking.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Screen Capture</h3>
            <p className="text-sm text-gray-600">
              Analyzes what's on your screen to provide contextual responses
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Audio Detection</h3>
            <p className="text-sm text-gray-600">
              Listens to interviewer questions and provides instant answers
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Synced Prep</h3>
            <p className="text-sm text-gray-600">
              Uses your interview prep from the web app for tailored responses
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Generate Interview Prep</h3>
                <p className="text-gray-600">Use the Mock Interview feature in the web app to generate your interview preparation materials</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Download & Install</h3>
                <p className="text-gray-600">Download the desktop app for your operating system and complete the installation</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Copy Context Package</h3>
                <p className="text-gray-600">From the Mock Interview page, click "Copy for Desktop App" to copy your interview prep</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Paste & Configure</h3>
                <p className="text-gray-600">Open the desktop app, paste your context package, and enter your Gemini API key</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Start Your Interview</h3>
                <p className="text-gray-600">Launch the session and get real-time assistance as the interviewer asks questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}