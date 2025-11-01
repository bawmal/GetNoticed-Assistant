import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Plus, X, MapPin, Briefcase, Clock, Bell, User, Shield, Palette } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('job-preferences')
  const [preferences, setPreferences] = useState({
    keywords: [],
    locations: [],
    countries: [],
    scrape_frequency: '4hours',
    notify_on_new_jobs: true,
    min_salary: '',
    max_salary: '',
    employment_types: [],
    target_companies: []
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newCompany, setNewCompany] = useState('')

  const countryOptions = [
    'United States',
    'Canada', 
    'United Kingdom',
    'Ireland',
    'Germany',
    'France',
    'Netherlands',
    'Sweden',
    'Norway',
    'Denmark',
    'Australia',
    'New Zealand',
    'Singapore',
    'Japan',
    'Remote/Worldwide'
  ]

  const tabs = [
    { id: 'job-preferences', label: 'Job Preferences', icon: Briefcase },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  const employmentTypeOptions = [
    'Full-time',
    'Part-time', 
    'Contract',
    'Freelance',
    'Internship',
    'Remote'
  ]

  const frequencyOptions = [
    { value: '1hour', label: 'Every hour' },
    { value: '4hours', label: 'Every 4 hours (recommended)' },
    { value: '12hours', label: 'Every 12 hours' },
    { value: '24hours', label: 'Once daily' }
  ]

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('job_scraping_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPreferences({
          keywords: data.keywords || [],
          locations: data.locations || [],
          countries: data.countries || [], // Will be empty array if column doesn't exist
          scrape_frequency: data.scrape_frequency || '4hours',
          notify_on_new_jobs: data.notify_on_new_jobs !== undefined ? data.notify_on_new_jobs : true,
          min_salary: data.min_salary || '',
          max_salary: '', // max_salary not in DB schema
          employment_types: data.employment_types || [],
          target_companies: data.target_companies || []
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()

      // Prepare data object, conditionally including countries if supported
      const saveData = {
        user_id: user.id,
        keywords: preferences.keywords,
        locations: preferences.locations,
        target_companies: preferences.target_companies,
        min_salary: preferences.min_salary ? parseInt(preferences.min_salary) : null,
        employment_types: preferences.employment_types,
        scrape_frequency: preferences.scrape_frequency,
        notify_on_new_jobs: preferences.notify_on_new_jobs,
        updated_at: new Date().toISOString()
      }

      // Only add countries if the array is not empty (indicates column exists)
      if (preferences.countries && preferences.countries.length >= 0) {
        saveData.countries = preferences.countries
      }

      const { error } = await supabase
        .from('job_scraping_preferences')
        .upsert(saveData, {
          onConflict: 'user_id'
        })

      if (error) throw error
      
      alert('✅ Preferences saved successfully!')
    } catch (error) {
      console.error('Error saving preferences:', error)
      
      // If it's a column doesn't exist error, show helpful message
      if (error.message && error.message.includes('countries')) {
        alert('❌ Please run the database migration first:\nALTER TABLE job_scraping_preferences ADD COLUMN countries TEXT[] DEFAULT ARRAY[]::TEXT[];')
      } else {
        alert('❌ Error saving preferences: ' + error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !preferences.keywords.includes(newKeyword.trim())) {
      setPreferences(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword) => {
    setPreferences(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const addLocation = () => {
    if (newLocation.trim() && !preferences.locations.includes(newLocation.trim())) {
      setPreferences(prev => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()]
      }))
      setNewLocation('')
    }
  }

  const removeLocation = (location) => {
    setPreferences(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }))
  }

  const addCompany = () => {
    if (newCompany.trim() && !preferences.target_companies.includes(newCompany.trim())) {
      setPreferences(prev => ({
        ...prev,
        target_companies: [...prev.target_companies, newCompany.trim()]
      }))
      setNewCompany('')
    }
  }

  const removeCompany = (company) => {
    setPreferences(prev => ({
      ...prev,
      target_companies: prev.target_companies.filter(c => c !== company)
    }))
  }

  const toggleEmploymentType = (type) => {
    setPreferences(prev => ({
      ...prev,
      employment_types: prev.employment_types.includes(type)
        ? prev.employment_types.filter(t => t !== type)
        : [...prev.employment_types, type]
    }))
  }

  const toggleCountry = (country) => {
    setPreferences(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  const renderJobPreferences = () => (
    <div className="space-y-8">
      {/* Keywords Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="text-primary-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Job Keywords</h3>
        </div>
        <p className="text-gray-600 mb-4">Add job titles, skills, or keywords you're interested in</p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            placeholder="e.g., Product Manager, React Developer"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={addKeyword}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {preferences.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="hover:bg-primary-200 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Countries Only - Simplified Location Filtering */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-primary-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Preferred Countries</h3>
        </div>
        <p className="text-gray-600 mb-4">Select countries where you'd like to work. Jobs will be filtered to match these countries (including remote jobs in these locations).</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {countryOptions.map((country) => (
            <label key={country} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.countries.includes(country)}
                onChange={() => toggleCountry(country)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{country}</span>
            </label>
          ))}
        </div>

        {preferences.countries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {preferences.countries.map((country, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {country}
                <button
                  onClick={() => toggleCountry(country)}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Employment Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Types</h3>
        <p className="text-gray-600 mb-4">Select the types of employment you're interested in</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {employmentTypeOptions.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.employment_types.includes(type)}
                onChange={() => toggleEmploymentType(type)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Range (Optional)</h3>
        <p className="text-gray-600 mb-4">Set your desired salary range in USD</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
            <input
              type="number"
              value={preferences.min_salary}
              onChange={(e) => setPreferences(prev => ({ ...prev, min_salary: e.target.value }))}
              placeholder="e.g., 80000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
            <input
              type="number"
              value={preferences.max_salary}
              onChange={(e) => setPreferences(prev => ({ ...prev, max_salary: e.target.value }))}
              placeholder="e.g., 150000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Target Companies */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Companies (Optional)</h3>
        <p className="text-gray-600 mb-2">Add specific companies you'd like to work for</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-sm">
            <strong>How it works:</strong> We'll scrape jobs from these companies using multiple methods:
          </p>
          <ul className="text-blue-700 text-sm mt-2 ml-4 list-disc">
            <li><strong>ATS Systems:</strong> Greenhouse, Lever (fast & reliable)</li>
            <li><strong>Company Websites:</strong> Direct careers page scraping</li>
            <li><strong>Job Board Filtering:</strong> Prioritize these companies in other sources</li>
          </ul>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCompany()}
            placeholder="e.g., Google, Stripe, Airbnb"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={addCompany}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {preferences.target_companies.map((company, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {company}
              <button
                onClick={() => removeCompany(company)}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Scraping Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-primary-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Scraping Frequency</h3>
        </div>
        <p className="text-gray-600 mb-4">How often should we check for new jobs?</p>
        
        <select
          value={preferences.scrape_frequency}
          onChange={(e) => setPreferences(prev => ({ ...prev, scrape_frequency: e.target.value }))}
          className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {frequencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-primary-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.notify_on_new_jobs}
            onChange={(e) => setPreferences(prev => ({ ...prev, notify_on_new_jobs: e.target.checked }))}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Email notifications</span>
            <p className="text-sm text-gray-600">Get notified when high-fit jobs are found</p>
          </div>
        </label>
      </div>
    </div>
  )

  const renderAccountSettings = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
      <p className="text-gray-600">Account management features coming soon...</p>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
      <p className="text-gray-600">Advanced notification settings coming soon...</p>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
      <p className="text-gray-600">Privacy controls coming soon...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and job search preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'job-preferences' && renderJobPreferences()}
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}

          {/* Save Button - Only show for job preferences */}
          {activeTab === 'job-preferences' && (
            <div className="mt-8 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const debugText = `Current Preferences:

Keywords: ${JSON.stringify(preferences.keywords)}
Locations: ${JSON.stringify(preferences.locations)}
Countries: ${JSON.stringify(preferences.countries)}
Employment Types: ${JSON.stringify(preferences.employment_types)}
Target Companies: ${JSON.stringify(preferences.target_companies)}
Min Salary: ${preferences.min_salary || 'Not set'}
Scrape Frequency: ${preferences.scrape_frequency}
Notifications: ${preferences.notify_on_new_jobs}`

                    console.log('🔍 Current Preferences:', preferences)
                    alert(debugText)
                  }}
                  className="btn-secondary flex items-center gap-2 px-4"
                >
                  🔍 Debug
                </button>
                <button
                  onClick={async () => {
                    const debugText = `Current Preferences:

Keywords: ${JSON.stringify(preferences.keywords)}
Locations: ${JSON.stringify(preferences.locations)}
Countries: ${JSON.stringify(preferences.countries)}
Employment Types: ${JSON.stringify(preferences.employment_types)}
Target Companies: ${JSON.stringify(preferences.target_companies)}
Min Salary: ${preferences.min_salary || 'Not set'}
Scrape Frequency: ${preferences.scrape_frequency}
Notifications: ${preferences.notify_on_new_jobs}`

                    try {
                      await navigator.clipboard.writeText(debugText)
                      alert('✅ Preferences copied to clipboard!')
                    } catch (error) {
                      console.error('Failed to copy:', error)
                      // Fallback: show text in a prompt for manual copying
                      prompt('Copy this text:', debugText)
                    }
                  }}
                  className="btn-secondary flex items-center gap-2 px-4"
                >
                  📋 Copy Debug Info
                </button>
              </div>
              <button
                onClick={savePreferences}
                disabled={saving}
                className="btn-primary flex items-center gap-2 px-8"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
