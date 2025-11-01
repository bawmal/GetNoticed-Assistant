import { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '../lib/supabase';
import { generateInterviewPrep } from '../lib/interviewGenerator';
import { MessageSquare, Briefcase, Target, Plus, Loader2, AlertCircle, FileText, TrendingUp, CheckCircle, Copy, Download } from 'lucide-react';

export default function MockInterview() {
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [error, setError] = useState(null);
  const [progressSteps, setProgressSteps] = useState([
    { label: 'Reviewing job requirements', progress: 0 },
    { label: 'Building question bank', progress: 0 },
    { label: 'Preparing response strategies', progress: 0 },
    { label: 'Creating strategic plan', progress: 0 }
  ]);
  const [copied, setCopied] = useState(false);
  const [additionalMaterials, setAdditionalMaterials] = useState('');

  const generateContextPackage = () => {
    if (!interviewPrep) return '';

    const selectedApp = applications.find(app => app.id === selectedAppId);
    if (!selectedApp) return '';

    // Format the context package
    let contextPackage = `# INTERVIEW CONTEXT PACKAGE\n`;
    contextPackage += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    contextPackage += `## JOB DETAILS\n`;
    contextPackage += `Position: ${selectedApp.job_title}\n`;
    contextPackage += `Company: ${selectedApp.company_name}\n\n`;
    
    if (selectedApp.job_description) {
      contextPackage += `## JOB DESCRIPTION\n${selectedApp.job_description}\n\n`;
    }

    contextPackage += `## INTERVIEW QUESTIONS & RESPONSES\n`;
    interviewPrep.questions.forEach((q, idx) => {
      contextPackage += `\n### Q${idx + 1}: ${q.question}\n`;
      contextPackage += `Category: ${q.category}\n`;
      contextPackage += `Framework: ${q.framework}\n\n`;
      contextPackage += `Response:\n${q.response}\n`;
      if (q.keyPoints && q.keyPoints.length > 0) {
        contextPackage += `\nKey Points:\n`;
        q.keyPoints.forEach(point => {
          contextPackage += `- ${point}\n`;
        });
      }
      contextPackage += `\n---\n`;
    });

    contextPackage += `\n## STAR STORIES\n`;
    interviewPrep.starStories.forEach((story, idx) => {
      contextPackage += `\n### ${story.title}\n`;
      contextPackage += `Situation: ${story.situation}\n`;
      contextPackage += `Task: ${story.task}\n`;
      contextPackage += `Action: ${story.action}\n`;
      contextPackage += `Result: ${story.result}\n`;
      contextPackage += `\n---\n`;
    });

    contextPackage += `\n## 90-DAY PLAN\n${interviewPrep.ninetyDayPlan}\n\n`;
    contextPackage += `## KEY PERFORMANCE INDICATORS\n${interviewPrep.kpis}\n`;

    return contextPackage;
  };

  const handleCopyContextPackage = async () => {
    const contextPackage = generateContextPackage();
    try {
      await navigator.clipboard.writeText(contextPackage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy context package');
    }
  };

  const handleDownloadContextPackage = () => {
    const contextPackage = generateContextPackage();
    const blob = new Blob([contextPackage], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-context-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const apps = await supabaseHelpers.getApplications(user.id);
      // Filter to only show Applied and Interviewing applications
      const activeApps = apps.filter(app => 
        app.status === 'applied' || app.status === 'interviewing'
      );
      setApplications(activeApps);
      
      if (activeApps.length > 0) {
        setSelectedAppId(activeApps[0].id);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrep = async () => {
    if (!selectedAppId) return;
    
    setGenerating(true);
    setError(null);
    setAdditionalMaterials(''); // Reset for new generation
    
    // Reset progress
    setProgressSteps([
      { label: 'Reviewing job requirements', progress: 0 },
      { label: 'Building question bank', progress: 0 },
      { label: 'Preparing response strategies', progress: 0 },
      { label: 'Creating strategic plan', progress: 0 }
    ]);
    
    // Animate progress bars
    const animateProgress = () => {
      let currentStep = 0;
      const interval = setInterval(() => {
        setProgressSteps(prev => {
          const newSteps = [...prev];
          if (currentStep < newSteps.length) {
            // For the last step, stop at 95% until AI finishes
            const maxProgress = currentStep === newSteps.length - 1 ? 95 : 100;
            
            if (newSteps[currentStep].progress < maxProgress) {
              newSteps[currentStep].progress += 5;
            }
            
            if (newSteps[currentStep].progress >= maxProgress && currentStep < newSteps.length - 1) {
              currentStep++;
            }
          }
          return newSteps;
        });
      }, 100);
      return interval;
    };
    
    const progressInterval = animateProgress();
    
    try {
      const selectedApp = applications.find(app => app.id === selectedAppId);
      const prep = await generateInterviewPrep(selectedApp, additionalMaterials);
      
      // Save interview prep to application for desktop app access
      await supabaseHelpers.saveInterviewPrepToApplication(selectedAppId, prep);
      
      // Complete all progress bars
      setProgressSteps([
        { label: 'Reviewing job requirements', progress: 100 },
        { label: 'Building question bank', progress: 100 },
        { label: 'Preparing response strategies', progress: 100 },
        { label: 'Creating strategic plan', progress: 100 }
      ]);
      
      clearInterval(progressInterval);
      
      // Small delay to show completion
      setTimeout(() => {
        setInterviewPrep(prep);
        setGenerating(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error generating interview prep:', error);
      setError('Failed to generate interview preparation. Please try again.');
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Preparing Interview Materials</h2>
            <p className="text-lg text-gray-600">Reviewing job requirements and building your preparation guide...</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {progressSteps.map((step, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium transition-colors ${
                    step.progress === 100 ? 'text-green-700' : 
                    step.progress > 0 ? 'text-blue-700' : 
                    'text-gray-400'
                  }`}>
                    {step.progress === 100 ? '✓' : step.progress > 0 ? '◐' : '○'} {step.label}
                  </span>
                  <span className={`text-xs font-semibold transition-colors ${
                    step.progress === 100 ? 'text-green-600' : 
                    step.progress > 0 ? 'text-blue-600' : 
                    'text-gray-400'
                  }`}>
                    {step.progress}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      step.progress === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                      'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${step.progress}%` }}
                  >
                    {step.progress > 0 && step.progress < 100 && (
                      <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (interviewPrep) {
    const selectedApp = applications.find(app => app.id === selectedAppId);
    return (
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Interview Preparation</h1>
            <p className="text-lg text-gray-600 mt-2">{selectedApp?.job_title} at {selectedApp?.company_name}</p>
          </div>
          <button
            onClick={() => setInterviewPrep(null)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
          >
            Back
          </button>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">📦 Export Your Interview Prep</h2>
              <p className="text-blue-100 text-sm">
                Copy for desktop app, download as PDF, or save to your account
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopyContextPackage}
              className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-md text-sm"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy for Desktop App
                </>
              )}
            </button>
            <button
              onClick={handleDownloadContextPackage}
              className="flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/20 transition-all border-2 border-white/30 text-sm"
            >
              <Download className="w-4 h-4" />
              Download TXT
            </button>
            <button
              onClick={async () => {
                // Save to Supabase
                try {
                  await supabaseHelpers.saveInterviewPrepToApplication(selectedAppId, interviewPrep);
                  alert('Interview prep saved successfully!');
                } catch (error) {
                  console.error('Save error:', error);
                  alert('Failed to save. Please try again.');
                }
              }}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Save to Account
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Executive Summary
          </h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {interviewPrep.analyzedProfile}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Interview Questions & Responses
          </h2>
          <div className="space-y-6">
            {interviewPrep.questions.map((q, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{q.question}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap ml-4">{q.category}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 italic">{q.framework}</p>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{q.response}</p>
                {q.keyPoints && q.keyPoints.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
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

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            STAR Stories
          </h2>
          <div className="space-y-6">
            {interviewPrep.starStories.map((story, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{story.title}</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-blue-600">Situation:</span>
                    <p className="text-gray-700 mt-1">{story.situation}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">Task:</span>
                    <p className="text-gray-700 mt-1">{story.task}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-yellow-600">Action:</span>
                    <p className="text-gray-700 mt-1">{story.action}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-purple-600">Result:</span>
                    <p className="text-gray-700 mt-1">{story.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            90-Day Plan
          </h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {interviewPrep.ninetyDayPlan}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            Key Performance Indicators
          </h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {interviewPrep.kpis}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-12">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mock Interview
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a job application to generate personalized interview preparation
          </p>
        </div>

        {/* What You'll Get - Modern Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What You'll Get</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-blue-100 hover:border-blue-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Tailored Interview Questions</h3>
                  <p className="text-gray-600">8-10 questions with frameworks (STAR, RICE)</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100 hover:border-purple-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">STAR Stories & 90-Day Plan</h3>
                  <p className="text-gray-600">Compelling examples and strategic roadmap</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-md">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Applications Yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Create a job application first to generate interview prep</p>
            <a 
              href="/job-analysis" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              New Application
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              Select a Job Application
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose the job you want to prepare for:
                </label>
                <div className="relative">
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium text-gray-900 bg-white hover:border-gray-300 transition-all appearance-none cursor-pointer"
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.job_title} at {app.company_name} {app.match_score ? `(${app.match_score}% match)` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {selectedAppId && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Selected Job Details
                  </h3>
                  {(() => {
                    const app = applications.find(a => a.id === selectedAppId);
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Position</p>
                          <p className="text-sm font-bold text-gray-900">{app.job_title}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Company</p>
                          <p className="text-sm font-bold text-gray-900">{app.company_name}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</p>
                          <p className="text-sm font-bold text-gray-900">{app.location || 'Remote'}</p>
                        </div>
                        {app.match_score && (
                          <div className="bg-white rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Match Score</p>
                            <p className="text-sm font-bold text-blue-600">{app.match_score}%</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Additional Materials Input */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Additional Prep Materials (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add any documents, links, or notes the company sent you to prepare for the interview. This will help tailor your responses.
                </p>
                <textarea
                  value={additionalMaterials}
                  onChange={(e) => setAdditionalMaterials(e.target.value)}
                  placeholder={`Paste interview prep documents, company research, links to resources, or any other materials...

Example:
- Company values and culture guide
- Technical assessment details  
- Team structure and org chart
- Project briefs or case studies
- Industry research articles`}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white resize-none"
                  rows={6}
                />
              </div>

              <button
                onClick={handleGeneratePrep}
                disabled={!selectedAppId}
                className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                <MessageSquare size={24} />
                Generate Interview Preparation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}