import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { geminiService } from '../lib/gemini'
import { Upload, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProfileSetup() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingProfile, setEditingProfile] = useState(null)
  
  const [formData, setFormData] = useState({
    profile_name: '',
    cv_file: null,
    cv_text: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const profilesData = await supabaseHelpers.getUserProfiles(user.id)
      setProfiles(profilesData)
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrimary = async (profileId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabaseHelpers.setPrimaryProfile(user.id, profileId)
      setSuccess('Primary profile updated!')
      await loadProfiles()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error setting primary profile:', error)
      setError('Failed to update primary profile')
    }
  }

  const handleEditProfile = (profile) => {
    setEditingProfile(profile)
    // Parse the master_experience JSON and populate form
    try {
      const parsedData = JSON.parse(profile.master_experience)
      
      // Convert parsed data back to comprehensive text format for editing
      let cvText = ''
      
      // Personal Info
      if (parsedData.personal_info) {
        const info = parsedData.personal_info
        cvText += `${info.name || ''}\n`
        cvText += `${info.email || ''} | ${info.phone || ''}\n`
        cvText += `${info.location || ''}\n`
        if (info.linkedin) cvText += `LinkedIn: ${info.linkedin}\n`
        if (info.portfolio) cvText += `Portfolio: ${info.portfolio}\n`
        cvText += '\n'
      }
      
      // Summary
      if (parsedData.summary) {
        cvText += `SUMMARY\n${parsedData.summary}\n\n`
      }
      
      // Experience
      if (parsedData.experience && parsedData.experience.length > 0) {
        cvText += 'EXPERIENCE\n\n'
        parsedData.experience.forEach(exp => {
          cvText += `${exp.title || ''}\n`
          cvText += `${exp.company || ''} | ${exp.location || ''}\n`
          cvText += `${exp.start_date || ''} - ${exp.current ? 'Present' : exp.end_date || ''}\n`
          cvText += `${exp.description || ''}\n`
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach(achievement => {
              cvText += `• ${achievement}\n`
            })
          }
          cvText += '\n'
        })
      }
      
      // Education
      if (parsedData.education && parsedData.education.length > 0) {
        cvText += 'EDUCATION\n\n'
        parsedData.education.forEach(edu => {
          cvText += `${edu.degree || ''}\n`
          cvText += `${edu.institution || ''} | ${edu.location || ''}\n`
          cvText += `${edu.start_date || ''} - ${edu.end_date || ''}\n`
          if (edu.gpa) cvText += `GPA: ${edu.gpa}\n`
          cvText += '\n'
        })
      }
      
      // Skills
      if (parsedData.skills && parsedData.skills.length > 0) {
        cvText += 'SKILLS\n'
        cvText += parsedData.skills.join(', ') + '\n\n'
      }
      
      // Certifications
      if (parsedData.certifications && parsedData.certifications.length > 0) {
        cvText += 'CERTIFICATIONS\n'
        parsedData.certifications.forEach(cert => {
          cvText += `${cert.name || ''} - ${cert.issuer || ''} (${cert.date || ''})\n`
        })
        cvText += '\n'
      }
      
      setFormData({
        profile_name: profile.profile_name,
        cv_file: null,
        cv_text: cvText.trim()
      })
    } catch (error) {
      console.error('Error parsing profile data:', error)
      setFormData({
        profile_name: profile.profile_name,
        cv_file: null,
        cv_text: ''
      })
    }
    // Scroll to form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFormData({ ...formData, cv_file: file })
    setError(null)

    // Extract text from file
    try {
      const text = await extractTextFromFile(file)
      setFormData(prev => ({ ...prev, cv_text: text }))
      setError(null)
    } catch (error) {
      console.error('File extraction error:', error)
      setError(error.message || 'Failed to read file. Please try PDF format or paste your CV text below.')
    }
  }

  const extractTextFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        const content = e.target.result
        
        if (file.type === 'text/plain') {
          resolve(content)
        } else if (file.type === 'application/pdf') {
          // Use Gemini to extract text from PDF
          try {
            const base64Data = content.split(',')[1] // Remove data URL prefix
            const text = await geminiService.extractTextFromDocument(base64Data, file.type)
            resolve(text)
          } catch (error) {
            console.error('PDF parsing error:', error)
            reject(new Error('Failed to parse PDF. Please try pasting your CV text below.'))
          }
        } else if (
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
          file.type === 'application/msword' || // .doc
          file.type === 'application/vnd.oasis.opendocument.text' // .odt
        ) {
          reject(new Error('Word documents are not supported. Please convert to PDF or paste your CV text below.'))
        } else {
          reject(new Error('Unsupported file type. Please use PDF or TXT files, or paste your CV text below.'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      
      // Read as base64 for documents, as text for plain text
      if (file.type === 'text/plain') {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setParsing(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Parse CV with Gemini
      const parsedData = await geminiService.parseCVContent(formData.cv_text)

      // Upload file if provided
      let cvPath = null
      if (formData.cv_file) {
        const uploadResult = await supabaseHelpers.uploadFile(
          user.id,
          formData.cv_file,
          'cvs'
        )
        cvPath = uploadResult.path
      }

      if (editingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            profile_name: formData.profile_name,
            master_cv_path: cvPath || editingProfile.master_cv_path,
            master_experience: JSON.stringify(parsedData),
            skills: parsedData.skills || {}
          })
          .eq('id', editingProfile.id)

        if (updateError) throw updateError

        setSuccess('Profile updated successfully!')
        setEditingProfile(null)
        setFormData({ profile_name: '', cv_file: null, cv_text: '' })
        await loadProfiles()
      } else {
        // Create new profile
        const profileData = {
          user_id: user.id,
          profile_name: formData.profile_name,
          master_cv_path: cvPath,
          is_primary: profiles.length === 0, // First profile is primary
          master_experience: JSON.stringify(parsedData),
          skills: parsedData.skills || {},
          photo_url: null
        }

        await supabaseHelpers.createProfile(profileData)

        // Create default user settings if first profile
        if (profiles.length === 0) {
          await supabaseHelpers.updateUserSettings(user.id, {
            language: 'en',
            default_ai_model: 'gemini-2.5-flash',
            notifications_enabled: true
          })
        }

        setSuccess('Profile created successfully!')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }

    } catch (error) {
      console.error('Error creating profile:', error)
      setError(error.message || 'Failed to create profile')
    } finally {
      setUploading(false)
      setParsing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900">Profile Setup</h1>
        <p className="text-gray-600 mt-2">
          Upload your CV to create a profile. We'll extract your experience and skills automatically.
        </p>
      </div>

      {/* Existing Profiles */}
      {profiles.length > 0 && (
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Your Profiles</h2>
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-2xl hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{profile.profile_name}</div>
                    {profile.is_primary && (
                      <span className="text-xs text-primary-600 font-medium">✓ Primary Profile</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!profile.is_primary && (
                    <button 
                      onClick={() => handleSetPrimary(profile.id)}
                      className="text-sm px-4 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold transition-all"
                    >
                      Make Primary
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditProfile(profile)}
                    className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Profile Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">
            {editingProfile ? 'Edit Profile' : profiles.length === 0 ? 'Create Your First Profile' : 'Add New Profile'}
          </h2>
          {editingProfile && (
            <button
              onClick={() => {
                setEditingProfile(null)
                setFormData({ profile_name: '', cv_file: null, cv_text: '' })
              }}
              className="text-sm px-4 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold transition-all"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Profile Name</label>
            <input
              type="text"
              value={formData.profile_name}
              onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="e.g., Software Engineer, Product Manager"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Give this profile a name (e.g., "Developer", "Manager")
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Upload CV (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors bg-white">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf"
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-700 font-medium mb-1">
                  {formData.cv_file ? formData.cv_file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF or TXT (Max 10MB) • For Word docs, please paste text below
                </p>
              </label>
            </div>
          </div>

          {/* CV Text Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Or Paste Your CV Text</label>
            <textarea
              value={formData.cv_text}
              onChange={(e) => setFormData({ ...formData, cv_text: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 transition-colors min-h-[300px] font-mono text-sm"
              placeholder="Paste your CV content here..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              We'll use AI to extract your experience, skills, and education
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading || !formData.cv_text}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {parsing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Parsing CV with AI...
                </>
              ) : uploading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  {editingProfile ? 'Updating Profile...' : 'Creating Profile...'}
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  {editingProfile ? 'Save Profile' : 'Create Profile'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
        <p className="text-sm text-gray-700">
          You can create multiple profiles for different career paths (e.g., "Software Engineer" and "Product Manager"). 
          Each profile will generate tailored applications based on that specific experience.
        </p>
      </div>
    </div>
  )
}
