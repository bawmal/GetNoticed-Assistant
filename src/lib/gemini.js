import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  console.warn('Gemini API key not found. AI features will be disabled.')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Get the Gemini model (back to experimental - wait for quota reset)
const getModel = () => {
  if (!genAI) throw new Error('Gemini API not initialized')
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp'
  })
}

export const geminiService = {
  // Scrape URL and extract job details
  async scrapeAndExtractJob(jobUrl) {
    try {
      // Use Supabase Edge Function to scrape (avoids CORS)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const scrapeUrl = `${supabaseUrl}/functions/v1/scrape-job`
      
      console.log('Scraping job URL:', jobUrl)
      
      const scrapeResponse = await fetch(scrapeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ url: jobUrl })
      })
      
      if (!scrapeResponse.ok) {
        throw new Error('Failed to scrape URL')
      }
      
      const { text } = await scrapeResponse.json()
      
      console.log('Scraped text length:', text.length)
      
      // Now extract job details from scraped text
      const model = getModel()
      
      const prompt = `Extract job posting information from this text:

${text}

Extract the following information in JSON format:
- title: The exact job title
- company: The company name  
- description: The complete job description (all relevant text)
- requirements: A list of key requirements (as an array)
- location: The job location
- salary: Any salary information (if available)

Return ONLY a valid JSON object with these fields.`

      const result = await model.generateContent(prompt)
      const resultResponse = await result.response
      const responseText = resultResponse.text()
      
      console.log('Gemini extraction response:', responseText)
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      
      const jobData = JSON.parse(jsonMatch[0])
      
      return {
        job_title: jobData.title || 'Unknown',
        company_name: jobData.company || 'Unknown',
        job_description: jobData.description || '',
        location: jobData.location || '',
        salary: jobData.salary || '',
        requirements: jobData.requirements || []
      }
    } catch (error) {
      if (isQuotaError(error)) {
        throw new Error('Quota exceeded. Please try again later.')
      }
      console.error('Job scraping error:', error)
      throw new Error(`Failed to scrape job: ${error.message}`)
    }
  },

  // Extract text from any document (PDF, DOC, DOCX, etc.) using Gemini
  async extractTextFromDocument(base64Data, mimeType) {
    if (!genAI) {
      throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your .env file.')
    }
    
    const model = getModel()
    
    const prompt = `Extract all text content from this document. Return only the plain text, preserving the structure and formatting as much as possible.`
    
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ])
      
      const response = await result.response
      const text = response.text()
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text extracted from document')
      }
      
      return text
    } catch (error) {
      console.error('Gemini document extraction error:', error)
      throw new Error(`Failed to extract text: ${error.message}`)
    }
  },

  // Fetch and extract job details from URL
  async fetchJobFromUrl(jobUrl) {
    try {
      // Fetch the job page content
      const response = await fetch(jobUrl)
      const html = await response.text()
      
      // Use Gemini to extract job details from HTML
      const model = getModel()
      const prompt = `Extract the job title, company name, and full job description from this job posting HTML.

Return a JSON object with this exact structure:
{
  "job_title": "string",
  "company_name": "string",
  "job_description": "string (full description)"
}

HTML Content:
${html.substring(0, 10000)}`

      const result = await model.generateContent(prompt)
      const responseText = await result.response
      const text = responseText.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract job details from URL')
      }
      
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Error fetching job from URL:', error)
      throw new Error('Failed to fetch job from URL. Please paste the job description manually.')
    }
  },

  // Extract job title and company name from job description
  async extractJobDetails(jobDescription, jobUrl = '') {
    const model = getModel()
    
    const prompt = `Extract the job title and company name from the following job posting.

Job URL: ${jobUrl || 'Not provided'}
Job Description:
${jobDescription}

Return a JSON object with this exact structure:
{
  "job_title": "string",
  "company_name": "string"
}

If you cannot find the information, use "Unknown" as the value.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { job_title: 'Unknown', company_name: 'Unknown' }
    }
    
    return JSON.parse(jsonMatch[0])
  },

  // Module 1: Parse CV and extract structured data
  async parseCVContent(cvText) {
    const model = getModel()
    
    const prompt = `You are an expert CV parser. Extract structured information from the following CV text.

Return a JSON object with this exact structure:
{
  "personal_info": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string",
    "github": "string"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string",
      "current": boolean,
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "graduation_date": "string",
      "gpa": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "tools": ["string"],
    "languages": ["string"]
  },
  "certifications": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string"
    }
  ]
}

CV Text:
${cvText}

IMPORTANT: For any missing information (dates, phone, email, etc.):
- Leave the field as an empty string ""
- NEVER use "N/A", "Not Available", "Unknown", or any placeholder text
- If information is not in the CV, just leave it blank

Return ONLY valid JSON, no markdown formatting or explanations.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean up response (remove markdown code blocks if present)
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    try {
      const parsed = JSON.parse(jsonText)
      console.log('✅ CV parsed successfully')
      console.log('  - Has certifications:', !!parsed.certifications)
      console.log('  - Certifications count:', parsed.certifications?.length || 0)
      return parsed
    } catch (error) {
      console.error('❌ Failed to parse CV JSON:', error)
      console.error('📄 Raw response (first 500 chars):', text.substring(0, 500))
      console.error('🧹 Cleaned JSON (first 500 chars):', jsonText.substring(0, 500))
      throw new Error('Failed to parse CV content. Please try again.')
    }
  },

  // Module 2: Analyze job posting and calculate fit score
  async analyzeJobFit(jobDescription, userProfile) {
    const model = getModel()
    
    const prompt = `You are a STRICT, CRITICAL ATS system and hiring manager. Analyze how well this candidate matches the job description using RIGOROUS scoring criteria.

Candidate Profile:
${JSON.stringify(userProfile, null, 2)}

Job Description:
${jobDescription}

STRICT SCORING CRITERIA (Be HARSH and REALISTIC):

1. REQUIRED QUALIFICATIONS (40 points max):
   - Years of experience: 0-10 points (exact match = 10, each year short = -2)
   - Required skills present: 0-15 points (ALL required = 15, missing any = -5 each)
   - Required education: 0-10 points (exact match = 10, close = 5, missing = 0)
   - Industry experience: 0-5 points (exact industry = 5, related = 2, different = 0)

2. PREFERRED QUALIFICATIONS (30 points max):
   - Preferred skills: 0-15 points (count how many are present)
   - Certifications: 0-10 points
   - Additional experience: 0-5 points

3. KEYWORD MATCH (20 points max):
   - Hard skills keyword density: 0-10 points (need 70%+ match)
   - Soft skills keyword density: 0-5 points (need 60%+ match)
   - Job title/role keywords: 0-5 points

4. ACHIEVEMENT RELEVANCE (10 points max):
   - Quantified results in relevant domain: 0-10 points

SCORING SCALE (Be REALISTIC):
- 90-100: Perfect match (RARE - only if candidate exceeds ALL requirements)
- 80-89: Excellent match (meets ALL required + most preferred)
- 70-79: Good match (meets ALL required + some preferred)
- 60-69: Moderate match (meets most required, missing some key items)
- 50-59: Weak match (missing several required items)
- Below 50: Poor match (should not apply)

CRITICAL: Be HARSH. Most candidates should score 60-75. Only truly exceptional matches score 80+.

Return a JSON object with this structure:
{
  "match_score": number (0-100, BE REALISTIC AND STRICT),
  "score_breakdown": {
    "required_qualifications": number (0-40),
    "preferred_qualifications": number (0-30),
    "keyword_match": number (0-20),
    "achievement_relevance": number (0-10)
  },
  "strengths": ["string (specific examples)"],
  "gaps": ["string (specific missing requirements)"],
  "recommendations": ["string (actionable improvements)"],
  "key_requirements_met": ["string"],
  "key_requirements_missing": ["string"],
  "overall_assessment": "string (be HONEST about fit level)"
}

BE CRITICAL. BE REALISTIC. Most candidates are 60-75% matches. Return ONLY valid JSON.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    try {
      return JSON.parse(jsonText)
    } catch (error) {
      console.error('Failed to parse job fit analysis:', error)
      throw new Error('Failed to analyze job fit. Please try again.')
    }
  },

  // Module 3: Generate tailored resume
  async generateTailoredResume(jobDescription, userProfile, jobAnalysis) {
    const model = getModel()
    
    const prompt = `You are an expert resume writer. Create a tailored resume for this specific job posting.

Job Description:
${jobDescription}

Candidate Profile:
${JSON.stringify(userProfile, null, 2)}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}

Create a resume that:
1. Highlights relevant experience and skills for THIS specific role
2. Uses keywords from the job description (ATS-friendly)
3. Quantifies achievements where possible
4. Emphasizes strengths identified in the analysis
5. Addresses gaps tactfully

Return a JSON object with this structure:
{
  "summary": "string (2-3 sentences tailored to this role)",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "dates": "string",
      "bullets": ["string (achievement-focused, quantified)"]
    }
  ],
  "skills": {
    "core": ["string (most relevant skills first)"],
    "technical": ["string"],
    "tools": ["string"]
  },
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "details": "string"
    }
  ],
  "certifications": ["string (list all relevant certifications from candidate profile)"],
  "projects": [
    {
      "name": "string",
      "description": "string (1-2 sentences)",
      "technologies": ["string"]
    }
  ]
}

Return ONLY valid JSON.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    try {
      return JSON.parse(jsonText)
    } catch (error) {
      console.error('Failed to parse tailored resume:', error)
      throw new Error('Failed to generate tailored resume. Please try again.')
    }
  },

  // Module 4: Generate cover letter
  async generateCoverLetter(jobDescription, companyName, userProfile, jobAnalysis) {
    const model = getModel()
    
    const prompt = `You are an expert cover letter writer. Create a compelling, personalized cover letter for this job application.

Job Description:
${jobDescription}

Company: ${companyName}

Candidate Profile:
${JSON.stringify(userProfile, null, 2)}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}

Write a cover letter that:
1. Opens with a strong hook showing genuine interest
2. Demonstrates understanding of the company/role
3. Highlights 2-3 most relevant achievements
4. Addresses how you'll add value
5. Shows personality while remaining professional
6. Closes with a clear call to action

Return a JSON object with this structure:
{
  "opening": "string (2-3 sentences)",
  "body_paragraphs": [
    "string (paragraph 1: why this company/role)",
    "string (paragraph 2: relevant experience)",
    "string (paragraph 3: how you'll add value)"
  ],
  "closing": "string (2-3 sentences)",
  "full_text": "string (complete letter)"
}

Return ONLY valid JSON.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    try {
      return JSON.parse(jsonText)
    } catch (error) {
      console.error('Failed to parse cover letter:', error)
      throw new Error('Failed to generate cover letter. Please try again.')
    }
  },

  // Module 8: Generate Strategic Job Brief (MVP CORE)
  async generateStrategicBrief(jobDescription, companyName, userProfile, jobAnalysis) {
    try {
      console.log('🔍 DEBUG: Strategic Brief Generation')
      console.log('📄 Job Description (first 200 chars):', jobDescription?.substring(0, 200))
      console.log('🏢 Company Name:', companyName)
      console.log('👤 User Profile:', userProfile?.profile_name)
      console.log('📊 Job Analysis:', jobAnalysis?.score + '% match')
      
      const model = getModel()
      
      const prompt = `You are a strategic career advisor creating a polished, executive-friendly strategic brief for a job application.

Job Description:
${jobDescription}

Company: ${companyName}

Candidate Profile:
${JSON.stringify(userProfile, null, 2)}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}

Create a comprehensive strategic brief in executive format. Use a confident, results-oriented tone that demonstrates strategic thinking and immediate value.

CRITICAL REQUIREMENTS:

1. PRODUCT VISION (2-3 sentences):
   - Articulate the transformative vision for this role/initiative
   - Connect to company mission and customer value
   - Show strategic understanding of market position

2. PROBLEM STATEMENT (1 paragraph):
   - Define the core business challenge or opportunity
   - Include market context, customer pain points, competitive threats
   - Set stage for your proposed solution

3. KEY FEATURES & YOUR CONTRIBUTION (3-5 features):
   - Each feature has:
     * Bold heading with clear value proposition
     * 2-3 sentences explaining the feature/initiative
     * "Contribution:" paragraph in italics showing YOUR specific experience and how you'd lead this
   - Features should be strategic, business-critical initiatives
   - Draw from candidate's actual achievements and expertise

4. TECHNICAL & ARCHITECTURAL PRINCIPLES (1 paragraph):
   - Outline technical approach, architecture, and design principles
   - Include scalability, security, compliance considerations
   - Show technical depth appropriate to the role

5. GO-TO-MARKET STRATEGY (1 paragraph):
   - Phased rollout approach
   - Key stakeholders and cross-functional collaboration
   - Risk mitigation and regulatory considerations
   - Customer education and adoption strategy

6. QUANTIFIABLE IMPACT & SUCCESS METRICS (5-6 metrics):
   - Each metric with:
     * Bold category (Customer Experience, Efficiency, Engagement, Revenue, Risk Reduction)
     * Specific, measurable targets with percentages/numbers
     * Business impact explanation

7. 90-DAY STRATEGIC PLAN:
   - Opening: Strategic context and overarching goal
   - Key Outcomes by 90 Days (3-4 major milestones)
   - Phase breakdown with specific, actionable items

Return a JSON object with this EXACT structure:
{
  "product_vision": "string (comprehensive product vision with bold headers for key initiatives)",
  "problem_statement": "string (detailed problem analysis with business impact)",
  "key_features": [
    {
      "heading": "string (feature name)",
      "description": "string (detailed feature description with benefits)",
      "contribution": "string (your specific contribution to this feature)"
    }
  ],
  "technical_principles": "string (technical architecture and principles)",
  "go_to_market_strategy": "string (go-to-market approach and strategy)",
  "success_metrics": [
    {
      "category": "string (Customer Experience, Efficiency, Engagement, Revenue, or Risk Reduction)",
      "target": "string (specific measurable target with percentages/numbers)",
      "impact": "string (business impact explanation)"
    }
  ],
  "ninety_day_plan": {
    "opening_statement": "string (strategic context and overarching goal)",
    "key_outcomes": ["string (3-4 major milestones by 90 days)"],
    "phase_1": {
      "title": "Phase 1: Day 1-30 — [Focus Area]",
      "actions": ["string (4-5 specific actions)"]
    },
    "phase_2": {
      "title": "Phase 2: Day 31-60 — [Focus Area]", 
      "actions": ["string (4-5 specific actions)"]
    },
    "phase_3": {
      "title": "Phase 3: Days 61-90 — [Focus Area]",
      "actions": ["string (4-5 specific actions)"]
    }
  }
}

TONE: Confident, strategic, and outcome-oriented. Show you understand the business and can deliver results.

Return ONLY valid JSON with no markdown formatting.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      let text = response.text()
      
      // More aggressive cleaning of markdown and extra content
      text = text
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .replace(/^```/gm, '')
        .trim()
      
      // Find JSON object boundaries
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error('No valid JSON found in response:', text)
        throw new Error('Failed to extract JSON from strategic brief response.')
      }
      
      const jsonText = text.substring(jsonStart, jsonEnd + 1)
      
      try {
        return JSON.parse(jsonText)
      } catch (parseError) {
        console.error('Failed to parse strategic brief JSON:', parseError)
        console.error('Extracted JSON:', jsonText)
        console.error('Raw response:', text)
        throw new Error('Failed to parse strategic brief response. Please try again.')
      }
    } catch (error) {
      console.error('Strategic brief generation error:', error)
      throw new Error(`Strategic brief generation failed: ${error.message}`)
    }
  },

  // Generate resume content (JSON structure for templates)
  async generateResumeContent(jobDescription, userProfile, jobAnalysis) {
    const model = getModel()
    
    // Debug: Log what certifications are in the profile
    console.log('🔍 generateResumeContent - Input certifications:', userProfile.certifications)
    console.log('🔍 Full userProfile keys:', Object.keys(userProfile))
    
    const prompt = `Create a tailored, ATS-optimized resume for this specific job application.

Job Description:
${jobDescription}

Candidate Profile:
${JSON.stringify(userProfile, null, 2)}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}

CRITICAL INSTRUCTIONS:

1. RELEVANCE & PRIORITIZATION:
   - Only include experience and skills that match this specific job
   - Prioritize the most relevant qualifications and achievements first
   - Focus on directly addressing requirements from the job posting
   - Reorder experience to highlight most relevant roles first
   - CONSOLIDATE EXPERIENCE: If candidate held multiple roles at same company, merge into single entry showing progression
   - Select 5-7 most impactful, non-redundant achievements per role to show clear career progression

2. ATS OPTIMIZATION (CRITICAL FOR SEARCHABILITY):
   - Extract ALL hard skills and soft skills from the job description
   - Incorporate exact keywords from the job description (use the EXACT phrases)
   - KEYWORD FREQUENCY TARGETS (repeat keywords naturally across resume):
     * Job title keywords: 7-10 times (e.g., "Product Management", "Product Manager")
     * Primary hard skills: 5-10 times each (e.g., "Finance", "Marketing", "Strategic Initiatives")
     * Secondary hard skills: 3-5 times each (e.g., "data-driven insights", "competitive analysis")
     * Soft skills: 2-3 times each (e.g., "prioritizing", "strategic thinking", "collaboration", "communication", "leadership")
   - KEYWORD PLACEMENT STRATEGY:
     * Summary: Include top 7-10 keywords naturally
     * Skills section: List ALL keywords from job description verbatim
     * Experience bullets: Weave keywords into achievements (e.g., "Led finance team", "Drove marketing initiatives", "Prioritizing strategic initiatives")
     * Use both noun and verb forms: "Finance" + "Financial", "Marketing" + "Market", "Collaboration" + "Collaborated"
   - Match terminology EXACTLY (e.g., "financial services industry" not "finance sector", "emerging technologies" not "new tech")
   - Include compound variations: "data-driven insights" AND "data driven insights" AND "data insights", "Product Strategy")
   - For compound skills, use both forms: "data-driven insights" AND "data driven insights"

3. PROFESSIONAL SUMMARY (ATS-CRITICAL):
   - MUST include the EXACT job title from the job description in the first sentence
   - Example: "Principal Product Manager with 10+ years..." (if applying for Principal Product Manager)
   - Create a laser-focused, 3-4 line pitch
   - Lead with job title, then most senior qualification and biggest quantified win
   - Tailor specifically to target role
   - This is read first - must confirm fit in 6 seconds
   - Include 1-2 key metrics that showcase impact
   - Example: "Principal Product Manager with 10+ years driving AI-first platform innovation. Delivered 28% margin improvement and 23% revenue growth across $50M+ portfolio. Expert in..."

4. QUANTIFIED ACHIEVEMENTS (MANDATORY):
   - Every achievement MUST include metrics, percentages, or tangible results
   - Examples: "Expanded access 5x", "Increased conversion by 42%", "Reduced time by 60%"
   - Use specific numbers, not vague terms
   - TARGET: 5-7 bullet points per role (more detail = better ATS score)
   - Each bullet should be 15-25 words for optimal detail and keyword density
   - Include context + action + result in each bullet

5. JOB TITLE ADJUSTMENT:
   - Review past job titles for relevance
   - If responsibilities overlap but title doesn't match, adjust slightly to show relevance
   - Example: "Senior Product Manager" → "Senior Product/Platform Manager"
   - NEVER fabricate or misrepresent - only highlight transferable skills
   - Keep adjustments truthful and minimal

6. THE "ACHIEVER" FORMULA (CRITICAL):
   - Start EVERY bullet point with a strong, active verb
   - Use: Spearheaded, Orchestrated, Consolidated, Launched, Optimized, Architected, Drove, Scaled, Pioneered
   - NEVER use: "Responsible for", "Assisted with", "Duties included", "Worked on", "Helped", "Supported"
   - Creates instant impact and signals proactive, result-oriented mindset

7. QUANTIFY EVERYTHING (MANDATORY):
   - Include hard numbers in 75%+ of achievements
   - Use: percentages, dollar amounts, team sizes, time saved, revenue generated
   - Examples: "Increased conversions by 42%", "Reduced manual review by 60%", "Led team of 20+ engineers"
   - Numbers are the language of business and validate impact

8. SHOWCASE STRATEGIC SCOPE (For Senior Roles):
   - Use language that demonstrates leadership and strategic thinking
   - Examples: "Secured cross-functional alignment", "Led strategic initiatives", "Owned P&L optimization"
   - Proves you operate at executive level, not task level

9. ELIMINATE WEAK LANGUAGE (STRICT):
   - NO personal pronouns: "I", "my", "me", "we"
   - NO passive voice or weak verbs
   - NO bloated paragraphs - use concise single-line bullets
   - NO generic phrases or AI markers
   - Maintain formal, objective tone focusing on accomplishments

10. BULLET POINT RULES (STRICT):
   - Format: "[Strong Action Verb] [what you did], [quantified result/impact]"
   - Each bullet = one complete achievement with impact
   - Concise, single-line bullets (not paragraphs)
   - NO hyphens (-), asterisks (*), or list markers in the text
   - Limit to 12-20 total bullets across all experience
   - Select 5-7 most impactful, non-redundant achievements per role

8. CONTACT INFORMATION - CRITICAL:
   - Extract contact info from: userProfile.personal_info
   - Copy these fields EXACTLY as they appear (do not modify or leave blank):
     * name: ${userProfile.personal_info?.name || ''}
     * email: ${userProfile.personal_info?.email || ''}
     * phone: ${userProfile.personal_info?.phone || ''}
     * location: ${userProfile.personal_info?.location || ''}
     * linkedin: ${userProfile.personal_info?.linkedin || ''}
     * portfolio: ${userProfile.personal_info?.portfolio || ''}
     * github: ${userProfile.personal_info?.github || ''}
   - If a field is empty/null in the profile, leave it empty in the output
   - DO NOT make up or modify any contact information

Generate resume content as JSON:
{
  "personalDetails": {
    "name": "${userProfile.personal_info?.name || ''}",
    "title": "string (job title being applied for)",
    "phone": "${userProfile.personal_info?.phone || ''}",
    "email": "${userProfile.personal_info?.email || ''}",
    "linkedin": "${userProfile.personal_info?.linkedin || ''}",
    "portfolio": "${userProfile.personal_info?.portfolio || ''}",
    "github": "${userProfile.personal_info?.github || ''}",
    "location": "${userProfile.personal_info?.location || ''}"
  },
  "summary": "string (2-3 sentences, tailored to role, with key metrics)",
  "skills": {
    "technical": ["string (HARD SKILLS ONLY - Product Management, Product Strategy, Roadmap Planning, Data Analysis, P&L Management, Go-to-Market Strategy, User Research, A/B Testing, Metrics & KPIs, Agile/Scrum, API Design, Platform Architecture, Growth Strategy, Product-Led Growth, etc. DO NOT include tools, industries, or soft skills here)"],
    "soft": ["string (INTERPERSONAL SKILLS ONLY - Leadership, Communication, Collaboration, Strategic Thinking, Cross-functional Leadership, Stakeholder Management, Decision-making, Prioritization, Presentation Skills, Negotiation, Mentorship, etc.)"],
    "tools": ["string (SOFTWARE/PLATFORMS ONLY - Jira, Figma, Confluence, Tableau, SQL, Python, AWS, Docker, Salesforce, Google Analytics, Amplitude, Mixpanel, Looker, React, Git, Jenkins, etc. NEVER leave this empty)"],
    "industry": ["string (DOMAIN EXPERTISE ONLY - Fintech, Healthcare, SaaS, E-commerce, B2B, B2C, Enterprise Software, Consumer Products, Financial Services, Payments, etc.)"]
  },
  "experience": [
    {
      "company": "string",
      "location": "string",
      "title": "string (adjusted for relevance if needed)",
      "start_date": "string",
      "end_date": "string (or 'Present')",
      "achievements": [
        "string (action verb + achievement + quantified result)",
        "string (no hyphens, asterisks, or generic starters)"
      ]
    }
  ],
  "education": [
    {
      "institution": "string (ONLY the institution name - CRITICAL: Remove ALL location data, coordinates, special characters, or gibberish. Example: 'Harvard University' NOT 'Harvard University, Cambridge, MA' or 'Harvard University, ѕ|Ÿœ')",
      "degree": "string",
      "field_of_study": "string",
      "graduation_year": "string (leave empty if not available - do NOT use 'N/A')"
    }
  ],
  "certifications": ["string (if relevant to job)"]
}

CRITICAL INSTRUCTIONS:

1. EDUCATION SECTION - CLEAN INSTITUTION NAMES:
   - Extract ONLY the institution name (e.g., "University of Toronto", "Harvard Business School")
   - Remove ALL of the following:
     * Location data (cities, states, countries)
     * Coordinates or special characters
     * Any gibberish or encoding artifacts
     * Commas followed by location info
   - If you see something like "Harvard University, Cambridge, MA, ѕ|Ÿœ" → output ONLY "Harvard University"

2. DATE FIELDS (start_date, end_date, graduation_year, graduation_date):
   - If the date is not available in the candidate profile, leave the field as an empty string ""
   - NEVER use "N/A", "Not Available", "TBD", or any placeholder text
   - Empty/missing dates will be hidden automatically in the resume template

3. SKILLS CATEGORIZATION (CRITICAL - FOLLOW STRICTLY):
   
   "technical" = HARD SKILLS ONLY (competencies, methodologies, disciplines)
   ✓ Include: Product Management, Product Strategy, Roadmap Planning, Data Analysis, P&L Management, Go-to-Market Strategy, User Research, A/B Testing, Metrics & KPIs, Agile/Scrum, API Design, Platform Architecture, Growth Strategy, Product-Led Growth, Market Research, Competitive Analysis
   ✗ DO NOT include: software tools, industries, or interpersonal skills
   
   "soft" = INTERPERSONAL SKILLS ONLY (people skills, leadership traits)
   ✓ Include: Leadership, Communication, Collaboration, Strategic Thinking, Cross-functional Leadership, Stakeholder Management, Decision-making, Prioritization, Presentation Skills, Negotiation, Mentorship
   ✗ DO NOT include: technical skills, tools, or methodologies
   
   "tools" = SOFTWARE/PLATFORMS ONLY (specific applications, programming languages)
   ✓ Include: Jira, Figma, Confluence, Tableau, SQL, Python, AWS, Docker, Salesforce, Google Analytics, Amplitude, Mixpanel, Looker, React, Git, Jenkins, Slack, Notion, Miro
   ✗ DO NOT include: methodologies, skills, or industries
   MANDATORY - Extract ALL tools from candidate profile - NEVER leave empty
   
   "industry" = DOMAIN EXPERTISE ONLY (sectors, markets, business models)
   ✓ Include: Fintech, Healthcare, SaaS, E-commerce, B2B, B2C, Enterprise Software, Consumer Products, Financial Services, Payments, Pharmaceutical, Retail
   ✗ DO NOT include: skills, tools, or methodologies

Return ONLY valid JSON with no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const resumeData = JSON.parse(jsonText)
    
    // Validate output quality
    if (resumeData.experience) {
      resumeData.experience.forEach((exp, i) => {
        if (exp.achievements) {
          exp.achievements = exp.achievements.map(achievement => {
            // Remove generic starters
            let cleaned = achievement
              .replace(/^(Responsible for|Utilized|Leveraged|Worked on)\s+/i, '')
              .replace(/^-\s*/, '') // Remove leading hyphens
              .replace(/^\*\s*/, '') // Remove leading asterisks
            
            // Ensure starts with action verb (capitalize first letter)
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
            
            return cleaned
          })
        }
      })
    }
    
    // Fallback: Ensure skills.tools is never empty
    console.log('🔍 Skills validation - userProfile.skills:', userProfile.skills)
    console.log('🔍 Generated resumeData.skills:', resumeData.skills)
    
    if (!resumeData.skills) resumeData.skills = {}
    if (!resumeData.skills.tools || resumeData.skills.tools.length === 0) {
      console.log('⚠️ Tools are empty, applying fallback...')
      
      // Extract tools from user profile
      const profileTools = userProfile.skills?.tools || []
      const profileTechnical = userProfile.skills?.technical || []
      
      console.log('  - profileTools:', profileTools)
      console.log('  - profileTechnical:', profileTechnical)
      
      // Common tools to look for in technical skills
      const toolKeywords = ['Jira', 'Figma', 'SQL', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Tableau', 'Salesforce', 'Git', 'Jenkins', 'Confluence', 'Agile', 'Scrum']
      const extractedTools = profileTechnical.filter(skill => 
        toolKeywords.some(tool => skill.toLowerCase().includes(tool.toLowerCase()))
      )
      
      console.log('  - extractedTools:', extractedTools)
      
      resumeData.skills.tools = [...profileTools, ...extractedTools].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
      
      if (resumeData.skills.tools.length === 0) {
        // Last resort: use some technical skills as tools
        resumeData.skills.tools = profileTechnical.slice(0, 5)
        console.log('  - Using technical skills as fallback:', resumeData.skills.tools)
      }
      
      console.log('✅ Tools populated from profile:', resumeData.skills.tools)
    } else {
      console.log('✅ Tools already populated by Gemini:', resumeData.skills.tools)
    }
    
    return resumeData
  },

  // Generate cover letter text (plain text for display)
  async generateCoverLetterText(jobDescription, companyName, jobTitle, userProfile, jobAnalysis) {
    try {
      console.log('🔍 Cover Letter Generation - Input Values:')
      console.log('  Job Title:', jobTitle)
      console.log('  Company Name:', companyName)
      console.log('  Job Title type:', typeof jobTitle)
      console.log('  Company Name type:', typeof companyName)
      
      const model = getModel()
      
      const prompt = `You are writing a professional cover letter for a job application at ${companyName}. Write ONLY the body text of the cover letter with authentic human voice and specific details.

Job Title: ${jobTitle}
Company: ${companyName}

Job Description:
${jobDescription}

Candidate Name: ${userProfile.personal_info?.name || 'Candidate'}

Candidate Profile:
${JSON.stringify(userProfile, null, 2)}

Job Analysis:
${JSON.stringify(jobAnalysis, null, 2)}

WRITING STYLE - CRITICAL:
Write with a professional yet authentic voice that embeds small but vivid human details:
- Include micro-stories or brief anecdotes that show lived experience
- Use effort-driven phrasing that reveals genuine personal investment (e.g., "After spending weeks analyzing...", "I found myself drawn to...")
- Add subtle reflections that show real thought process (e.g., "What struck me most...", "I've come to realize...")
- Use natural, conversational language - avoid corporate jargon and generic phrases
- Remove generic hyphens and long dashes - use more natural language flow
- Each sentence should have unique human fingerprints that no generic AI could mass-produce
- Show imperfect nuance and authentic personality while remaining professional

CRITICAL INSTRUCTION - READ CAREFULLY:
The job title is: ${jobTitle}
The company name is: ${companyName}

You MUST use these EXACT values in your cover letter. DO NOT leave them blank or use placeholders.

CONTENT REQUIREMENTS:
1. Opening Paragraph (3-4 sentences):
   - CRITICAL: Your first sentence MUST be: "I'm excited to apply for the ${jobTitle} role at ${companyName}."
   - DO NOT write "at." or "role at." - you MUST include the full company name
   - EVERY time you mention the company, use the full name: ${companyName}
   - Express specific excitement about ${companyName} and the ${jobTitle} role
   - Mention what genuinely attracts you about ${companyName} (mission, values, or opportunity)
   - Reference ${companyName}'s focus or recent initiatives if clearly stated
   - Be authentic and show you've researched ${companyName}

2. Transition Statement:
   - Use EXACTLY: "A few highlights that align directly with ${companyName}'s needs:"
   - DO NOT write "'s needs" without the company name before it
   - This introduces the bullet points naturally

3. Bullet Points (EXACTLY 3 key qualifications):
   - CRITICAL: Each bullet MUST be on a NEW LINE with blank line before it
   - Keep bullets CONCISE: Maximum 1-2 sentences (30-40 words each)
   - Select the 3 MOST RELEVANT qualifications that match job requirements
   - Start with years of experience or key strength
   - Include ONE specific, quantified achievement per bullet
   - Show direct relevance to the role requirements
   - Format: "[Years/Strength]: [Brief description with ONE metric in parentheses]"
   - Example: "10+ years of product leadership driving platform businesses, with a proven record of reducing churn and growing revenue (23% growth across $50M+ portfolio)"
   - DO NOT write long paragraphs - keep bullets SHORT and scannable
   - ONLY 3 bullets - quality over quantity

4. Closing Paragraph (3-4 sentences with strong call-to-action):
   - CRITICAL: Start this on a NEW LINE after the last bullet
   - Add a blank line between the last bullet and this paragraph
   - First sentence: Express genuine enthusiasm about contributing to the company's mission/goals
   - Second sentence: Briefly connect your experience to their specific needs or challenges
   - Third sentence: Strong call-to-action - express eagerness to discuss how you can contribute (e.g., "I'd welcome the opportunity to discuss how my experience can help ${companyName} achieve [specific goal]")
   - Final sentence: "Thank you for considering my application."
   - Make it confident, forward-looking, and action-oriented
   - CRITICAL: This must be a SEPARATE paragraph, NOT part of the bullets
   - DO NOT continue writing on the same line as the last bullet

5. Keep it concise: Total length should be 250-350 words

FORMATTING EXAMPLE:
I'm excited to apply for the Senior Product Manager role at Hopper. Your mission to make travel accessible resonates with me. I'm energized by opportunities to use product thinking to improve safety and access for real people, and believe my experience building scalable platforms positions me well to contribute.

A few highlights that align directly with Hopper's needs:

• 10+ years of product leadership driving platform and marketplace businesses, with a proven record of reducing churn and growing revenue (23% growth across $50M+ portfolio)

• Strong technical product experience in API-first architecture and microservices migrations (reduced onboarding time by 60%, increased transaction capacity by 30%)

• Data-driven, execution-focused delivery: launched AI-enabled features in 90-day sprints and leveraged analytics to improve conversion and retention (42% increase)

I'm genuinely excited about Hopper's mission to make travel more accessible and affordable for everyone. My track record of building scalable, data-driven platforms aligns well with your focus on innovation and customer-centric product development. I'd welcome the opportunity to discuss how my experience can help Hopper continue to revolutionize the travel industry and deliver exceptional value to your users. Thank you for considering my application.

FORMATTING INSTRUCTIONS:
- Write ONLY the cover letter body text (paragraphs between greeting and closing)
- DO NOT include name, address, phone, email, or date (added automatically)
- DO NOT include "Dear Hiring Manager," (added automatically)
- DO NOT include "Sincerely," or signature (added automatically)
- DO NOT use markdown formatting (no **, *, \`\`\`, or code blocks)
- DO NOT use placeholder text like "[Platform]" or brackets []
- DO NOT include any meta-commentary or explanations
- Use plain text with natural paragraph breaks
- Use • for bullet points (not *, -, or numbers)
- CRITICAL STRUCTURE: Opening paragraph → blank line → Transition statement → blank line → Bullet 1 → blank line → Bullet 2 → blank line → Bullet 3 → blank line → Closing paragraph
- Each section MUST be separated by a blank line
- The closing paragraph MUST start on a new line after the last bullet

Write the authentic, human cover letter body now:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()
    
    // Clean up any markdown or meta-commentary that might have slipped through
    text = text
      .replace(/```markdown\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/\[.*?\]/g, '') // Remove bracket placeholders
      .replace(/^(Okay,|Here's|Here is|I've|I have).*/gim, '') // Remove meta-commentary
      .replace(/^Key improvements.*/gims, '') // Remove explanations
      .replace(/^To further improve.*/gims, '') // Remove suggestions
      .replace(/Dear Hiring Manager,?\n?/gi, '') // Remove greeting (we add it)
      .replace(/Sincerely,?\n?.*/gis, '') // Remove closing (we add it)
      .replace(/,\s*as advertised on\s*\.?/gi, '') // Remove incomplete "as advertised on" phrases
      
      // Fix incomplete sentences with missing company info
      .replace(/at\.\s+What/gi, `at ${companyName}. What`)
      .replace(/at\.\s+I/gi, `at ${companyName}. I`)
      .replace(/about\s+was/gi, `about ${companyName} was`)
      .replace(/drawn to\s+'s/gi, `drawn to ${companyName}'s`)
      .replace(/align directly with\s+'s needs/gi, `align directly with ${companyName}'s needs`)
      .replace(/\s+'s\s+/g, ` ${companyName}'s `) // Replace possessive with company name
      .replace(/drawn to 's mission/gi, 'drawn to this opportunity')
      .replace(/mission to \./gi, 'mission.')
      .replace(/at\s+reflects that/gi, 'in this role')
      .replace(/\s+\.\s+/g, '. ') // Fix spacing around periods
      .replace(/\s+,\s+/g, ', ') // Fix spacing around commas
      .replace(/\s{2,}/g, ' ') // Normalize multiple spaces
      .trim()
    
      // Force line breaks before bullet points if they're missing
      text = text.replace(/([.!?:])\s*•/g, '$1\n\n•')  // Add double newline before bullets (including after colon)
      text = text.replace(/:\s*•/g, ':\n\n•')  // Specifically handle colon before bullet
      
      // CRITICAL: Split bullets that are on the same line
      // Match: bullet ending with punctuation + space + another bullet
      text = text.replace(/(•[^•]+[.!?])\s+(•)/g, '$1\n\n$2')  // Split consecutive bullets
      
      // Also handle bullets without ending punctuation (more aggressive)
      text = text.replace(/(•[^•]{30,})\s+(•)/g, '$1\n\n$2')  // Split bullets with 30+ chars
      
      text = text.replace(/•\s+/g, '• ')  // Normalize bullet spacing
      
      // AGGRESSIVE: Force line break after last bullet before closing paragraph
      // Split the text into lines and find the last bullet
      const lines = text.split('\n')
      let lastBulletIndex = -1
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().startsWith('•')) {
          lastBulletIndex = i
          break
        }
      }
      
      // If we found a bullet, check if there's text after it on the same line or next line
      if (lastBulletIndex !== -1) {
        const lastBulletLine = lines[lastBulletIndex]
        // Check if the bullet line has additional text after the bullet ends (closing paragraph)
        const bulletMatch = lastBulletLine.match(/^(•[^.!?]+[.!?])\s+([A-Z].+)$/)
        if (bulletMatch) {
          // Split: bullet part and closing part
          lines[lastBulletIndex] = bulletMatch[1]
          lines.splice(lastBulletIndex + 1, 0, '', bulletMatch[2])  // Add blank line + closing
        }
      }
      
      text = lines.join('\n')
      
      // Log the cleaned text for debugging
      console.log('Cleaned cover letter text length:', text.length)
      console.log('First 500 chars:', text.substring(0, 500))
      console.log('Has newlines:', text.includes('\n'))
      console.log('Bullet count:', (text.match(/•/g) || []).length)
      
      // Only validate minimum length, don't filter sentences aggressively
      if (!text || text.length < 100) {
        console.error('Cover letter too short. Full text:', text)
        throw new Error('Generated cover letter is too short or empty')
      }
      
      return text
    } catch (error) {
      console.error('Cover letter generation error:', error)
      throw new Error(`Cover letter generation failed: ${error.message}`)
    }
  }
}
