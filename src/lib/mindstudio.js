// MindStudio API integration for job URL scraping and analysis
import { supabase } from './supabase'

const appId = import.meta.env.VITE_MINDSTUDIO_APP_ID
const apiKey = import.meta.env.VITE_MINDSTUDIO_API_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export const mindstudioService = {
  // Fetch and analyze job from URL using MindStudio workflow
  async fetchJobFromUrl(jobUrl, userCV) {
    if (!appId || !apiKey) {
      throw new Error('MindStudio API not configured. Please add VITE_MINDSTUDIO_APP_ID and VITE_MINDSTUDIO_API_KEY to your .env file.')
    }

    try {
      // Parse userCV if it's a string
      let parsedCV = userCV
      if (typeof userCV === 'string') {
        try {
          parsedCV = JSON.parse(userCV)
        } catch (e) {
          console.error('Failed to parse userCV:', e)
        }
      }
      
      // Transform the CV data to match MindStudio's expected format
      const formattedCV = {
        name: parsedCV.personal_info?.name || '',
        headline: parsedCV.personal_info?.title || parsedCV.summary?.substring(0, 100) || '',
        location: {
          city_province: parsedCV.personal_info?.location || ''
        },
        contact: {
          email: parsedCV.personal_info?.email || '',
          phone: parsedCV.personal_info?.phone || '',
          linkedin: parsedCV.personal_info?.linkedin || ''
        },
        summary: parsedCV.summary || '',
        experience: (parsedCV.experience || []).map(exp => ({
          company: exp.company || '',
          location: exp.location || '',
          title: exp.title || '',
          start_date: exp.start_date || '',
          end_date: exp.current ? 'Present' : (exp.end_date || ''),
          achievements: exp.achievements || [exp.description] || []
        })),
        education: (parsedCV.education || []).map(edu => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          field_of_study: edu.field_of_study || edu.major || ''
        })),
        skills: parsedCV.skills || [],
        certifications: parsedCV.certifications?.map(cert => cert.name || cert) || []
      }
      
      const requestBody = {
        pageUrl: jobUrl,
        userCV: formattedCV,
        appId: appId, // The app ID from env
        workflow: 'Main' // Your workflow name
      }
      
      console.log('MindStudio Request:', {
        pageUrl: jobUrl,
        formattedCV: formattedCV
      })
      
      // Use Supabase Edge Function proxy to avoid CORS issues
      const proxyUrl = `${supabaseUrl}/functions/v1/mindstudio-proxy`
      
      console.log('Calling proxy:', proxyUrl)
      
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      
      console.log('Has auth token:', !!token)
      console.log('Request body:', requestBody)
      
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Proxy response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('MindStudio API Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: apiUrl
        })
        
        if (response.status === 404) {
          throw new Error('MindStudio workflow not found. Please check that your workflow is published and the API URL is correct.')
        }
        
        throw new Error(`MindStudio API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      console.log('MindStudio Full Response:', JSON.stringify(data, null, 2))
      
      // Check if this is an async response (callbackInProgress)
      if (data.callbackInProgress) {
        console.log('Async execution started, polling for results...')
        // Poll for results
        const threadId = data.threadId
        return await this.pollForResults(threadId)
      }
      
      // MindStudio API returns: { success, threadId, thread, result }
      // The result contains our workflow output variables
      const result = data.result || {}
      
      console.log('Extracted Result:', result)
      
      const jobData = result.jobData || {}
      const skillsAnalysis = result.skillsAnalysis || {}
      
      return {
        job_title: jobData.title || 'Unknown',
        company_name: jobData.company || 'Unknown',
        job_description: jobData.description || '',
        location: jobData.location || '',
        salary: jobData.salary || '',
        requirements: jobData.requirements || [],
        analysis: skillsAnalysis,
        resumeContent: result.resumeContent || {},
        coverLetter: result.coverLetter || '',
        applicationStrategy: result.applicationStrategy || '',
        emailTemplates: result.emailTemplates || {},
        resumePdf: result.resumePdf || '',
        coverLetterPdf: result.coverLetterPdf || ''
      }
    } catch (error) {
      console.error('MindStudio API error:', error)
      throw new Error(`Failed to fetch job from URL: ${error.message}`)
    }
  },

  // Poll MindStudio for async results
  async pollForResults(threadId, maxAttempts = 60) {
    const proxyUrl = `${supabaseUrl}/functions/v1/mindstudio-poll`
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Polling attempt ${attempt + 1}/${maxAttempts}...`)
      
      // Wait 5 seconds between polls
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      try {
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
          },
          body: JSON.stringify({ threadId, appId })
        })
        
        if (!response.ok) continue
        
        const data = await response.json()
        
        // Check if workflow is finished
        if (data.thread?.isFinished) {
          console.log('Workflow completed!', data)
          
          const result = data.result || {}
          const jobData = result.jobData || {}
          const skillsAnalysis = result.skillsAnalysis || {}
          
          return {
            job_title: jobData.title || 'Unknown',
            company_name: jobData.company || 'Unknown',
            job_description: jobData.description || '',
            location: jobData.location || '',
            salary: jobData.salary || '',
            requirements: jobData.requirements || [],
            analysis: skillsAnalysis,
            resumeContent: result.resumeContent || {},
            coverLetter: result.coverLetter || '',
            applicationStrategy: result.applicationStrategy || '',
            emailTemplates: result.emailTemplates || {},
            resumePdf: result.resumePdf || '',
            coverLetterPdf: result.coverLetterPdf || ''
          }
        }
      } catch (error) {
        console.error('Poll error:', error)
      }
    }
    
    throw new Error('Workflow timed out after 5 minutes')
  },

  // Generate cover letter using MindStudio Webhook (Synchronous)
  async generateCoverLetterWebhook(jobDescription, companyName, jobTitle, userProfile, jobAnalysis) {
    // Use the synchronous run endpoint instead of webhook
    const apiUrl = 'https://v1.mindstudio-api.com/developer/v2/apps/run/main-3d6eb641'
    const apiKey = import.meta.env.VITE_MINDSTUDIO_API_KEY
    
    try {
      console.log('🚀 Calling MindStudio webhook for cover letter...')
      console.log('📊 Input Parameters:')
      console.log('  Job Title:', jobTitle)
      console.log('  Company:', companyName)
      console.log('  Job Description length:', jobDescription?.length || 0)
      console.log('  User Profile:', userProfile ? 'Present' : 'Missing')
      console.log('  Job Analysis:', jobAnalysis ? 'Present' : 'Missing')
      
      const payload = {
        webhookParams: {
          jobTitle: jobTitle || '',
          companyName: companyName || '',
          jobDescription: jobDescription || '',
          candidateProfile: JSON.stringify(userProfile || {}),
          jobAnalysis: JSON.stringify(jobAnalysis || {})
        }
      }
      
      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2))
      
      if (!apiKey) {
        throw new Error('MindStudio API key not configured. Please add VITE_MINDSTUDIO_API_KEY to your .env file.')
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          variables: payload.webhookParams,
          workflow: 'main'
        })
      })
      
      console.log('📥 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ MindStudio error response:', errorText)
        throw new Error(`MindStudio webhook failed: ${response.statusText} - ${errorText}`)
      }
      
      // Get response as text first to see what we're getting
      const responseText = await response.text()
      console.log('📥 Raw response text:', responseText.substring(0, 500))
      
      if (!responseText) {
        throw new Error('MindStudio returned empty response')
      }
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError)
        console.error('Response text:', responseText)
        throw new Error('MindStudio returned invalid JSON')
      }
      
      console.log('✅ MindStudio response received:', data)
      
      // MindStudio returns the output in data.coverLetter or data.output
      return data.coverLetter || data.output || data
    } catch (error) {
      console.error('❌ MindStudio webhook error:', error)
      throw error
    }
  },

  // Generate cover letter using MindStudio (OLD METHOD - keeping for backup)
  async generateCoverLetter(jobDescription, companyName, jobTitle, userProfile, jobAnalysis) {
    if (!appId || !apiKey) {
      throw new Error('MindStudio API not configured')
    }

    try {
      const proxyUrl = `${supabaseUrl}/functions/v1/mindstudio-proxy`
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      // Launch variables matching MindStudio workflow structure
      const requestBody = {
        appId: appId,
        workflow: 'CoverLetterOnly', // Your workflow name
        // Match the exact structure MindStudio expects
        jobData: {
          title: jobTitle,
          company: companyName,
          description: jobDescription
        },
        userCV: {
          name: userProfile.personal_info?.name || '',
          headline: userProfile.personal_info?.title || userProfile.summary?.substring(0, 100) || '',
          location: {
            city_province: userProfile.personal_info?.location || ''
          },
          contact: {
            email: userProfile.personal_info?.email || '',
            phone: userProfile.personal_info?.phone || '',
            linkedin: userProfile.personal_info?.linkedin || ''
          },
          summary: userProfile.summary || '',
          experience: (userProfile.experience || []).map(exp => ({
            company: exp.company || '',
            location: exp.location || '',
            title: exp.title || '',
            start_date: exp.start_date || '',
            end_date: exp.current ? 'Present' : (exp.end_date || ''),
            achievements: exp.achievements || []
          })),
          education: (userProfile.education || []).map(edu => ({
            institution: edu.institution || '',
            degree: edu.degree || '',
            field_of_study: edu.field_of_study || ''
          })),
          skills: userProfile.skills?.technical || [],
          certifications: userProfile.certifications || []
        },
        skillsAnalysis: {
          matchPercentage: jobAnalysis?.matchPercentage || jobAnalysis?.match_score || 0,
          requirementsMet: jobAnalysis?.requirementsMet || jobAnalysis?.strengths || [],
          skillGaps: jobAnalysis?.skillGaps || jobAnalysis?.gaps || [],
          recommendations: jobAnalysis?.improvementSuggestions || jobAnalysis?.recommendations || []
        },
        resumeData: userProfile, // Full profile for reference
        companySearch: `Company: ${companyName}` // Placeholder for company research
      }
      
      console.log('MindStudio Cover Letter Request:', requestBody)
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`MindStudio cover letter generation failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // Handle async execution
      if (data.callbackInProgress) {
        const result = await this.pollForResults(data.threadId)
        return result.coverLetter || result.result?.coverLetter || ''
      }
      
      return data.result?.coverLetter || ''
    } catch (error) {
      console.error('MindStudio cover letter generation error:', error)
      throw new Error(`Failed to generate cover letter via MindStudio: ${error.message}`)
    }
  },

  // Generate PDFs only (fast workflow)
  async generatePDFs(resumeContent, coverLetterText, jobTitle, companyName) {
    if (!appId || !apiKey) {
      throw new Error('MindStudio API not configured')
    }

    try {
      const proxyUrl = `${supabaseUrl}/functions/v1/mindstudio-pdf`
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          resumeContent,
          coverLetterText,
          jobTitle,
          companyName,
          appId,
          workflow: 'PDFOnly' // New simplified workflow
        })
      })

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        resumePdf: data.result?.resumePdf || '',
        coverLetterPdf: data.result?.coverLetterPdf || ''
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`Failed to generate PDFs: ${error.message}`)
    }
  }
}
