import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

// Pages
import Landing from './pages/LandingModern'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import JobAnalysis from './pages/JobAnalysis'
import ApplicationView from './pages/ApplicationView'
import JobDiscovery from './pages/JobDiscovery'
import Settings from './pages/Settings'
import AutoFillBookmarklet from './pages/AutoFillBookmarklet'
import MockInterview from './pages/MockInterview'
import InterviewBuddy from './pages/InterviewBuddy'
import InterviewAssistantDocs from './pages/InterviewAssistantDocs'

// Layout
import Layout from './components/Layout'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/interview-assistant/docs" element={<InterviewAssistantDocs />} />
        {/* Public preview route for Landing page regardless of auth */}
        <Route path="/landing-preview" element={<Landing />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            session ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile-setup"
          element={
            session ? (
              <Layout>
                <ProfileSetup />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/job-analysis"
          element={
            session ? (
              <Layout>
                <JobAnalysis />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/application/:id"
          element={
            session ? (
              <Layout>
                <ApplicationView />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/jobs"
          element={
            session ? (
              <Layout>
                <JobDiscovery />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/settings"
          element={
            session ? (
              <Layout>
                <Settings />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/autofill"
          element={
            session ? (
              <Layout>
                <AutoFillBookmarklet />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mock-interview"
          element={
            session ? (
              <Layout>
                <MockInterview />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/interview-buddy"
          element={
            session ? (
              <Layout>
                <InterviewBuddy />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
