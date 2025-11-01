import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client if credentials are missing (for demo/landing page)
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signInWithOAuth: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null })
  }
})

export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const supabaseHelpers = {
  // User Profile Operations
  async getUserProfiles(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getPrimaryProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createProfile(profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(profileId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async setPrimaryProfile(userId, profileId) {
    // First, set all profiles to non-primary
    const { error: resetError } = await supabase
      .from('user_profiles')
      .update({ is_primary: false })
      .eq('user_id', userId)
    
    if (resetError) throw resetError

    // Then set the selected profile as primary
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_primary: true })
      .eq('id', profileId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Application Operations
  async getApplications(userId, filters = {}) {
    let query = supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.minScore) {
      query = query.gte('match_score', filters.minScore)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async createApplication(applicationData) {
    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateApplication(applicationId, updates) {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', applicationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteApplication(applicationId) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)
    
    if (error) throw error
    return { success: true }
  },

  // Desktop App Integration
  async getInterviewPrepForDesktop(userId) {
    // Get user's primary profile
    const profile = await this.getPrimaryProfile(userId)
    
    // Get active applications (applied or interviewing)
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['applied', 'interviewing'])
      .order('created_at', { ascending: false })
    
    if (appsError) throw appsError

    // Extract interview prep from drafts
    const interviewData = applications
      .filter(app => app.drafts?.interviewPrep)
      .map(app => ({
        applicationId: app.id,
        jobTitle: app.job_title,
        companyName: app.company_name,
        status: app.status,
        interviewPrep: app.drafts.interviewPrep
      }))

    return {
      profile: {
        name: profile.profile_name,
        cv: profile.master_experience,
        skills: profile.skills
      },
      interviews: interviewData
    }
  },

  async saveInterviewPrepToApplication(applicationId, interviewPrep) {
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('drafts')
      .eq('id', applicationId)
      .single()
    
    if (fetchError) throw fetchError

    const updatedDrafts = {
      ...app.drafts,
      interviewPrep
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update({ drafts: updatedDrafts })
      .eq('id', applicationId)
    
    if (updateError) throw updateError
    return { success: true }
  },

  // User Settings Operations
  async getUserSettings(userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateUserSettings(userId, settings) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...settings })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // File Upload Operations
  async uploadFile(userId, file, folder = 'cvs') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('user-assets')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: urlData } = supabase.storage
      .from('user-assets')
      .getPublicUrl(fileName)
    
    return {
      path: fileName,
      url: urlData.publicUrl
    }
  },

  async deleteFile(filePath) {
    const { error } = await supabase.storage
      .from('user-assets')
      .remove([filePath])
    
    if (error) throw error
  }
}
