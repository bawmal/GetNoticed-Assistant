/**
 * CV-Based Job Matching
 * Analyzes user's CV against job descriptions to calculate match scores
 */

/**
 * Calculate CV-based match score between user profile and job
 * @param {Object} userProfile - User's profile with CV data
 * @param {Object} job - Job posting
 * @returns {Object} Match score and breakdown
 */
export function calculateCVMatch(userProfile, job) {
  const breakdown = {
    skillsMatch: 0,
    experienceMatch: 0,
    titleMatch: 0,
    descriptionMatch: 0,
    total: 0,
    details: [],
    matchedSkills: [],
    missingSkills: []
  }
  
  if (!userProfile || !job) {
    return breakdown
  }
  
  // Handle skills - could be array, JSONB, or string
  let userSkills = []
  if (Array.isArray(userProfile.skills)) {
    userSkills = userProfile.skills
  } else if (typeof userProfile.skills === 'string') {
    try {
      userSkills = JSON.parse(userProfile.skills)
    } catch (e) {
      userSkills = []
    }
  } else if (userProfile.skills && typeof userProfile.skills === 'object') {
    userSkills = Object.values(userProfile.skills)
  }
  
  console.log('🔧 User skills from profile:', userSkills)
  
  // Parse experience - handle JSON format
  let userExperience = userProfile.master_experience || ''
  if (userExperience && typeof userExperience === 'string' && userExperience.trim().startsWith('{')) {
    try {
      const cvData = JSON.parse(userExperience)
      const parts = []
      
      console.log('📄 Parsing CV JSON, keys:', Object.keys(cvData))
      
      // Extract work experience (try multiple field names)
      const workExp = cvData.work_experience || cvData.workExperience || cvData.experience || []
      if (Array.isArray(workExp)) {
        workExp.forEach(job => {
          if (job.title) parts.push(job.title)
          if (job.company) parts.push(job.company)
          if (job.description) parts.push(job.description)
          if (job.responsibilities) parts.push(job.responsibilities)
        })
      }
      
      // Extract education
      const education = cvData.education || []
      if (Array.isArray(education)) {
        education.forEach(edu => {
          if (edu.degree) parts.push(edu.degree)
          if (edu.field) parts.push(edu.field)
        })
      }
      
      // Extract summary/objective
      if (cvData.summary) parts.push(cvData.summary)
      if (cvData.objective) parts.push(cvData.objective)
      if (cvData.professional_summary) parts.push(cvData.professional_summary)
      
      userExperience = parts.filter(p => p).join('\n')
      console.log('✅ Extracted experience length:', userExperience.length)
      
      // Also extract skills from CV JSON if not already populated
      if (userSkills.length < 5 && cvData.skills) {
        const cvSkills = []
        if (Array.isArray(cvData.skills)) {
          cvSkills.push(...cvData.skills)
        } else if (typeof cvData.skills === 'object') {
          // Skills might be grouped: { technical: [...], soft: [...] }
          Object.values(cvData.skills).forEach(skillGroup => {
            if (Array.isArray(skillGroup)) {
              cvSkills.push(...skillGroup)
            } else if (typeof skillGroup === 'string') {
              cvSkills.push(skillGroup)
            }
          })
        }
        
        if (cvSkills.length > 0) {
          userSkills = [...new Set([...userSkills, ...cvSkills])]
          console.log('✅ Added skills from CV JSON, total:', userSkills.length)
        }
      }
    } catch (e) {
      console.error('❌ Failed to parse CV JSON:', e)
      // Keep original if parsing fails
    }
  }
  
  const jobTitle = job.title?.toLowerCase() || ''
  const jobDescription = job.description?.toLowerCase() || ''
  
  console.log('🔍 CV Match Debug:', {
    jobTitle: job.title,
    experienceLength: userExperience.length,
    experienceSample: userExperience.substring(0, 100),
    skillsCount: userSkills.length
  })
  
  // 1. Skills Match (30 points) - Reduced from 40 to be less punitive
  const { score: skillScore, matched, missing } = matchSkills(userSkills, jobDescription, userExperience, job)
  breakdown.skillsMatch = Math.round(skillScore * 0.75) // Scale down from 40 to 30 max
  breakdown.matchedSkills = matched
  breakdown.missingSkills = missing
  
  if (matched.length > 0) {
    breakdown.details.push({
      category: 'Skills Match',
      score: breakdown.skillsMatch,
      max: 30,
      description: `${matched.length} matching skills: ${matched.slice(0, 5).join(', ')}${matched.length > 5 ? '...' : ''}`
    })
  }
  
  // 2. Experience Match (35 points) - Increased from 30 to reward strong PM experience
  const expScore = matchExperience(userExperience, jobDescription, jobTitle)
  breakdown.experienceMatch = Math.round(expScore * 1.17) // Scale up from 30 to 35 max
  
  if (expScore > 0) {
    breakdown.details.push({
      category: 'Experience Match',
      score: breakdown.experienceMatch,
      max: 35,
      description: 'Relevant experience found in CV'
    })
  }
  
  // 3. Title Match (20 points) - Check if user has held similar roles
  const titleScore = matchJobTitle(userExperience, jobTitle)
  breakdown.titleMatch = titleScore
  
  if (titleScore > 0) {
    breakdown.details.push({
      category: 'Title Match',
      score: titleScore,
      max: 20,
      description: 'Similar role in work history'
    })
  }
  
  // 4. Domain & Keywords Match (15 points) - CV alignment with job domain
  const domainScore = matchDomainAlignment(userExperience, jobDescription, job.title || '')
  breakdown.domainMatch = domainScore
  
  if (domainScore > 0) {
    breakdown.details.push({
      category: 'Domain Match',
      score: domainScore,
      max: 15,
      description: 'CV experience aligns with job domain'
    })
  }
  
  // 5. Description Match (5 points) - Additional context  
  const descScore = matchDescriptionKeywords(userExperience, jobDescription)
  breakdown.descriptionMatch = descScore
  
  if (descScore > 0) {
    breakdown.details.push({
      category: 'Keyword Match',
      score: descScore,
      max: 10,
      description: 'CV keywords match job description'
    })
  }
  
  // Calculate total
  breakdown.total = Math.min(100, 
    breakdown.skillsMatch + 
    breakdown.experienceMatch + 
    breakdown.titleMatch + 
    breakdown.domainMatch + 
    breakdown.descriptionMatch
  )
  
  return breakdown
}

/**
 * Match user skills against job requirements
 */
function matchSkills(userSkills, jobDescription, userExperience = '', job = {}) {
  const matched = []
  const missing = []
  
  // Safety check - ensure userSkills is an array
  if (!Array.isArray(userSkills)) {
    console.warn('⚠️ userSkills is not an array:', typeof userSkills)
    userSkills = []
  }
  
  const expLower = userExperience.toLowerCase()
  
  // Infer skills from job titles in experience (more selective)
  const inferredSkills = []
  if (expLower.includes('product manager') || expLower.includes('head of product')) {
    inferredSkills.push('product management', 'roadmap') // Only core PM skills
  }
  if (expLower.includes('senior') || expLower.includes('lead') || expLower.includes('principal') || 
      expLower.includes('director') || expLower.includes('head')) {
    inferredSkills.push('leadership', 'communication') // Leadership roles have communication
  }
  // More selective but include communication for leadership roles
  
  // Flatten and clean user skills (handle nested arrays)
  const flattenedSkills = []
  userSkills.forEach(skill => {
    if (Array.isArray(skill)) {
      flattenedSkills.push(...skill.filter(s => s && typeof s === 'string'))
    } else if (skill && typeof skill === 'string') {
      flattenedSkills.push(skill)
    }
  })
  
  // Combine explicit and inferred skills (ensure all are strings)
  const validSkills = flattenedSkills.filter(s => s && typeof s === 'string')
  const allUserSkills = [...new Set([...validSkills.map(s => s.toLowerCase()), ...inferredSkills])]
  
  // Common job skills to check for (context-aware based on job title)
  const jobSkills = extractJobSkills(jobDescription, job.title || '')
  
  // Check which user skills match
  validSkills.forEach(skill => {
    const skillLower = skill.toLowerCase()
    if (jobDescription.includes(skillLower)) {
      matched.push(skill)
    }
  })
  
  // Check which job skills are missing (excluding inferred skills)
  jobSkills.forEach(skill => {
    const skillLower = skill.toLowerCase()
    const hasSkill = allUserSkills.some(us => us === skillLower)
    
    // Only add to missing if it's a technical skill (not soft skills that are inferred)
    const isTechnicalSkill = !['product management', 'roadmap', 'leadership', 'communication'].includes(skillLower)
    
    if (!hasSkill && isTechnicalSkill) {
      // Generate contextual gap explanation
      const gapExplanation = generateSkillGapExplanation(skill, job.title || '', jobDescription)
      missing.push({
        skill: skill,
        explanation: gapExplanation,
        importance: determineSkillImportance(skill, jobDescription)
      })
    }
  })
  
  // Calculate score including inferred skills
  const totalMatched = matched.length + inferredSkills.filter(inf => 
    jobSkills.some(js => js.toLowerCase() === inf)
  ).length
  
  // More generous scoring - don't over-penalize for domain transitions
  let score = 0
  if (totalMatched > 0) {
    // Base score for having any matches
    score = Math.max(15, totalMatched * 8) // Minimum 15 points if any skills match
    
    // Special boost for PM roles with domain-specific requirements (AI, crypto, etc.)
    const isAIRole = (job.title || '').toLowerCase().includes('ai') || jobDescription.includes('artificial intelligence')
    const isCryptoRole = (job.title || '').toLowerCase().includes('crypto') || jobDescription.includes('cryptocurrency')
    const isSpecializedPMRole = isAIRole || isCryptoRole
    
    if (isSpecializedPMRole && inferredSkills.length > 0) {
      // Give extra credit for core PM competencies in specialized domains
      const pmCompetencies = inferredSkills.filter(skill => 
        ['product management', 'leadership', 'roadmap'].includes(skill)
      ).length
      score += pmCompetencies * 5 // Bonus for PM fundamentals
    }
    
    // Bonus for high match ratio
    const matchRatio = jobSkills.length > 0 ? totalMatched / jobSkills.length : 0
    if (matchRatio > 0.5) {
      score += Math.round((matchRatio - 0.5) * 20) // Bonus for >50% match
    }
  }
  
  score = Math.min(40, score) // Cap at 40 points
  
  return { score, matched, missing }
}

/**
 * Extract skills mentioned in job description (context-aware)
 */
function extractJobSkills(jobDescription, jobTitle = '') {
  const skills = new Set()
  const lowerDesc = jobDescription.toLowerCase()
  const lowerTitle = jobTitle.toLowerCase()
  
  // Determine if this is a technical role
  const isTechnicalRole = lowerTitle.includes('engineer') || lowerTitle.includes('developer') || 
                         lowerTitle.includes('architect') || lowerTitle.includes('devops')
  
  const isPMRole = lowerTitle.includes('product manager') || lowerTitle.includes('product lead') ||
                  lowerTitle.includes('head of product') || lowerTitle.includes('director of product') ||
                  lowerTitle.includes('head of ai') || lowerTitle.includes('ai product') ||
                  (lowerTitle.includes('head of') && lowerDesc.includes('product'))
  
  // Skills relevant to different role types
  const technicalSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
    'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask',
    'sql', 'postgresql', 'mysql', 'mongodb', 'docker', 'kubernetes', 'aws', 'azure'
  ]
  
  const pmSkills = [
    'product management', 'agile', 'scrum', 'roadmap', 'analytics', 'jira', 'figma',
    'user research', 'a/b testing', 'metrics', 'kpis', 'fintech', 'payments',
    // Crypto-specific skills
    'crypto', 'cryptocurrency', 'blockchain', 'defi', 'bitcoin', 'ethereum', 'web3',
    'onchain', 'smart contracts', 'dao', 'nft', 'viral growth', 'virality',
    'referral programs', 'social engagement', 'consumer growth',
    // AI/ML product management skills
    'artificial intelligence', 'ai', 'machine learning', 'ml', 'data science',
    'predictive modeling', 'ai algorithms', 'ml frameworks', 'ai products',
    'ai strategy', 'ai governance', 'ai ethics', 'data analytics', 'ai platform',
    'generative ai', 'gen ai', 'llm', 'natural language processing', 'computer vision'
  ]
  
  const universalSkills = [
    'leadership', 'communication', 'problem solving', 'teamwork', 'data analysis'
  ]
  
  // Only check technical skills for technical roles
  if (isTechnicalRole) {
    technicalSkills.forEach(skill => {
      if (lowerDesc.includes(skill)) {
        skills.add(skill)
      }
    })
  }
  
  // Always check PM skills for PM roles
  if (isPMRole) {
    pmSkills.forEach(skill => {
      if (lowerDesc.includes(skill)) {
        skills.add(skill)
      }
    })
  }
  
  // Always check universal skills
  universalSkills.forEach(skill => {
    if (lowerDesc.includes(skill)) {
      skills.add(skill)
    }
  })
  
  return Array.from(skills)
}

/**
 * Generate contextual explanation for skill gaps
 */
function generateSkillGapExplanation(skill, jobTitle, jobDescription) {
  const skillLower = skill.toLowerCase()
  const titleLower = jobTitle.toLowerCase()
  const descLower = jobDescription.toLowerCase()
  
  // Context-specific explanations
  const explanations = {
    'fintech': `Experience in financial technology is highly valued for this ${titleLower} role. Consider highlighting any work with financial products, payments, or banking systems.`,
    'payments': `Payments expertise is crucial for this role. Consider gaining experience with payment systems, transaction processing, or financial services.`,
    'metrics': `Strong analytical skills with metrics and KPIs are essential. Consider showcasing experience with data analysis, A/B testing, or performance measurement.`,
    'a/b testing': `A/B testing experience is important for product optimization. Consider learning about experimentation frameworks and statistical analysis.`,
    'user research': `User research skills are valuable for understanding customer needs. Consider experience with user interviews, surveys, or usability testing.`,
    'figma': `Design collaboration tools like Figma are commonly used. Consider familiarizing yourself with design tools and working with design teams.`,
    'jira': `Project management tools like Jira are standard in most organizations. Consider gaining experience with agile project management platforms.`,
    'kpis': `Key Performance Indicator (KPI) definition and tracking is essential for measuring product success. Consider experience with metrics and analytics.`,
    'data analysis': `Data analysis skills are increasingly important for product decisions. Consider strengthening your analytical and statistical skills.`
  }
  
  return explanations[skillLower] || `${skill} appears to be important for this role based on the job description. Consider adding this skill to strengthen your profile.`
}

/**
 * Determine skill importance based on job description context
 */
function determineSkillImportance(skill, jobDescription) {
  const descLower = jobDescription.toLowerCase()
  const skillLower = skill.toLowerCase()
  
  // Count mentions and context to determine importance
  const mentions = (descLower.match(new RegExp(skillLower, 'g')) || []).length
  const isInRequirements = descLower.includes('require') && descLower.includes(skillLower)
  const isInResponsibilities = descLower.includes('responsib') && descLower.includes(skillLower)
  
  if (mentions > 2 || isInRequirements) {
    return 'critical'
  } else if (mentions > 1 || isInResponsibilities) {
    return 'important'
  } else {
    return 'nice-to-have'
  }
}

/**
 * Match CV domain alignment with job requirements
 */
function matchDomainAlignment(userExperience, jobDescription, jobTitle) {
  const expLower = userExperience.toLowerCase()
  const descLower = jobDescription.toLowerCase()
  const titleLower = jobTitle.toLowerCase()
  
  let score = 0
  
  // Define domain-specific keyword clusters
  const domainClusters = {
    fintech: ['fintech', 'financial', 'banking', 'payments', 'transactions', 'money', 'currency', 'wallet', 'credit', 'debit', 'fraud', 'compliance', 'pci', 'kyc', 'aml'],
    payments: ['payments', 'checkout', 'billing', 'invoicing', 'revenue', 'cashier', 'pos', 'terminal', 'gateway', 'processor', 'merchant', 'acquirer'],
    government: ['government', 'public sector', 'municipal', 'federal', 'state', 'civic', 'policy', 'regulation', 'compliance', 'procurement', 'grants'],
    saas: ['saas', 'cloud', 'subscription', 'multi-tenant', 'api', 'integration', 'platform', 'enterprise', 'b2b', 'scalability'],
    ecommerce: ['ecommerce', 'retail', 'marketplace', 'shopping', 'cart', 'inventory', 'fulfillment', 'logistics', 'b2c', 'consumer'],
    healthcare: ['healthcare', 'medical', 'patient', 'clinical', 'hipaa', 'ehr', 'telemedicine', 'pharma', 'hospital', 'provider'],
    crypto: ['crypto', 'blockchain', 'bitcoin', 'ethereum', 'defi', 'nft', 'web3', 'smart contracts', 'consensus', 'mining']
  }
  
  // Identify job domain
  let jobDomain = null
  let maxDomainMatches = 0
  
  for (const [domain, keywords] of Object.entries(domainClusters)) {
    const matches = keywords.filter(keyword => descLower.includes(keyword) || titleLower.includes(keyword)).length
    if (matches > maxDomainMatches) {
      maxDomainMatches = matches
      jobDomain = domain
    }
  }
  
  // Score CV alignment with identified domain
  if (jobDomain && domainClusters[jobDomain]) {
    const domainKeywords = domainClusters[jobDomain]
    const cvMatches = domainKeywords.filter(keyword => expLower.includes(keyword)).length
    
    // Score based on percentage of domain keywords found in CV
    const alignmentRatio = cvMatches / Math.min(domainKeywords.length, 8) // Cap at 8 keywords
    score = Math.round(alignmentRatio * 15) // Max 15 points
    
    console.log(`🎯 Domain: ${jobDomain}, CV matches: ${cvMatches}/${domainKeywords.length}, Score: ${score}`)
  }
  
  // Bonus for specific company/product mentions
  const companyKeywords = extractCompanyKeywords(descLower)
  const companyMatches = companyKeywords.filter(keyword => expLower.includes(keyword)).length
  if (companyMatches > 0) {
    score += Math.min(3, companyMatches) // Up to 3 bonus points
  }
  
  return Math.min(15, score)
}

/**
 * Extract company/product specific keywords
 */
function extractCompanyKeywords(jobDescription) {
  const keywords = []
  
  // Look for specific technologies, frameworks, tools mentioned
  const techPatterns = [
    /\b(react|vue|angular|node\.js|python|java|kubernetes|docker|aws|azure|gcp)\b/g,
    /\b(stripe|paypal|square|plaid|twilio|salesforce|hubspot|zendesk)\b/g,
    /\b(jira|confluence|figma|sketch|tableau|looker|mixpanel|amplitude)\b/g
  ]
  
  techPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern) || []
    keywords.push(...matches)
  })
  
  return [...new Set(keywords)]
}

/**
 * Match user experience against job requirements
 */
function matchExperience(userExperience, jobDescription, jobTitle) {
  const expLower = userExperience.toLowerCase()
  const descLower = jobDescription.toLowerCase()
  const titleLower = jobTitle.toLowerCase()
  
  let score = 0
  
  // Check for seniority level match (with equivalents) - More generous for leadership roles
  const seniorityEquivalents = {
    'senior': ['senior', 'sr', 'sr.', 'lead', 'group', 'staff', 'principal'],
    'lead': ['lead', 'senior', 'sr', 'group', 'staff', 'principal'],
    'group': ['group', 'senior', 'sr', 'lead', 'staff', 'principal'],
    'staff': ['staff', 'senior', 'sr', 'lead', 'group', 'principal'],
    'principal': ['principal', 'staff', 'senior', 'sr', 'lead', 'group'],
    'junior': ['junior', 'jr', 'jr.', 'associate', 'entry'],
    'director': ['director', 'head', 'vp'],
    'head': ['head', 'director', 'vp', 'chief'] // Add head equivalents
  }
  
  let jobSeniority = null
  for (const [level, equivalents] of Object.entries(seniorityEquivalents)) {
    if (titleLower.includes(level)) {
      jobSeniority = level
      break
    }
  }
  
  if (jobSeniority) {
    const equivalents = seniorityEquivalents[jobSeniority] || []
    const hasEquivalentSeniority = equivalents.some(level => expLower.includes(level))
    
    if (hasEquivalentSeniority) {
      // More generous scoring for leadership roles
      const isLeadershipRole = titleLower.includes('head') || titleLower.includes('director') || 
                              titleLower.includes('vp') || titleLower.includes('chief')
      const hasLeadershipExp = expLower.includes('head') || expLower.includes('director') || 
                              expLower.includes('vp') || expLower.includes('chief')
      
      if (isLeadershipRole && hasLeadershipExp) {
        score += 22 // High score for leadership-to-leadership match
      } else {
        // Check for step-up scenarios
        const isStepUp = (expLower.includes('senior') && (titleLower.includes('principal') || titleLower.includes('group'))) ||
                        (expLower.includes('lead') && titleLower.includes('principal'))
        
        score += isStepUp ? 18 : 20 // More generous base scoring
      }
    } else {
      score += 12 // Has experience but different seniority
    }
  } else {
    score += 15 // No specific seniority required - more generous
  }
  
  // Check for industry/domain experience - expanded list
  const industries = ['fintech', 'healthcare', 'e-commerce', 'saas', 'b2b', 'b2c', 'enterprise', 
                     'cpg', 'retail', 'food', 'consumer goods', 'ai', 'artificial intelligence', 
                     'machine learning', 'data science']
  const matchedIndustries = industries.filter(industry => 
    descLower.includes(industry) && expLower.includes(industry)
  )
  
  if (matchedIndustries.length > 0) {
    score += 8 // Slightly reduced to balance with other factors
  }
  
  // Check for years of experience - more generous for senior roles
  const yearsMatch = descLower.match(/(\d+)\+?\s*years?/i)
  if (yearsMatch) {
    const requiredYears = parseInt(yearsMatch[1])
    const userYears = estimateYearsOfExperience(userExperience)
    
    if (userYears >= requiredYears) {
      const yearsBonus = userYears > requiredYears + 3 ? 8 : 6 // Bonus for exceeding requirements
      score += yearsBonus
    }
  }
  
  return Math.min(30, score) // Increased cap to 30 for better scoring range
}

/**
 * Match job title against user's work history
 */
function matchJobTitle(userExperience, jobTitle) {
  const expLower = userExperience.toLowerCase()
  const titleLower = jobTitle.toLowerCase()
  
  // Equivalent seniority levels (these should match)
  const seniorityEquivalents = {
    'senior': ['senior', 'sr', 'sr.', 'lead', 'group', 'staff', 'principal'],
    'lead': ['lead', 'senior', 'sr', 'group', 'staff', 'principal'],
    'group': ['group', 'senior', 'sr', 'lead', 'staff', 'principal'],
    'staff': ['staff', 'senior', 'sr', 'lead', 'group', 'principal'],
    'principal': ['principal', 'staff', 'senior', 'sr', 'lead', 'group'],
    'director': ['director', 'head', 'vp', 'vice president', 'principal', 'senior'],
    'head': ['head', 'director', 'vp', 'principal', 'senior', 'lead'],
    'junior': ['junior', 'jr', 'jr.', 'associate', 'entry'],
    'mid': ['mid', 'intermediate', '']
  }
  
  // Core roles to match
  const coreRoles = [
    'product manager', 'software engineer', 'data scientist', 'designer',
    'developer', 'analyst', 'engineer', 'architect', 'researcher'
  ]
  
  // Find core role in job title
  const jobCoreRole = coreRoles.find(role => titleLower.includes(role))
  
  if (jobCoreRole) {
    // Check if user has this core role
    if (expLower.includes(jobCoreRole)) {
      // Core role matches! Now check seniority
      
      // Extract seniority from job title
      let jobSeniority = null
      for (const [level, equivalents] of Object.entries(seniorityEquivalents)) {
        if (titleLower.includes(level)) {
          jobSeniority = level
          break
        }
      }
      
      // Check if user has equivalent seniority
      if (jobSeniority) {
        const equivalentLevels = seniorityEquivalents[jobSeniority] || []
        const hasEquivalentSeniority = equivalentLevels.some(level => expLower.includes(level))
        
        if (hasEquivalentSeniority) {
          // Check if this is a step-up (Senior -> Principal/Group)
          const isStepUp = (expLower.includes('senior') && (titleLower.includes('principal') || titleLower.includes('group'))) ||
                          (expLower.includes('lead') && titleLower.includes('principal'))
          
          return isStepUp ? 15 : 18 // Reduce score for step-ups
        } else {
          return 12 // Same role, different seniority
        }
      } else {
        return 15 // Same role, no specific seniority mentioned
      }
    }
  }
  
  // Partial match - check if any role keywords match
  const partialMatch = coreRoles.some(role => {
    const words = role.split(' ')
    return words.some(word => word.length > 3 && titleLower.includes(word) && expLower.includes(word))
  })
  
  if (partialMatch) {
    return 10
  }
  
  return 0
}

/**
 * Match general keywords between CV and job description
 */
function matchDescriptionKeywords(userExperience, jobDescription) {
  const expWords = new Set(
    userExperience.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4)
  )
  
  const descWords = jobDescription.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4)
  
  // Count matching words
  let matches = 0
  descWords.forEach(word => {
    if (expWords.has(word)) {
      matches++
    }
  })
  
  // Calculate score (10 points max)
  const matchRatio = descWords.length > 0 ? matches / descWords.length : 0
  return Math.round(matchRatio * 10)
}

/**
 * Estimate years of experience from CV text
 */
function estimateYearsOfExperience(cvText) {
  // Look for year ranges (e.g., "2020 - 2023")
  const yearRanges = cvText.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi) || []
  
  let totalYears = 0
  const currentYear = new Date().getFullYear()
  
  yearRanges.forEach(range => {
    const match = range.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i)
    if (match) {
      const startYear = parseInt(match[1])
      const endYear = match[2].match(/\d{4}/) ? parseInt(match[2]) : currentYear
      totalYears += (endYear - startYear)
    }
  })
  
  return totalYears
}

/**
 * Get match quality label
 */
export function getMatchQuality(score) {
  if (score >= 80) return { label: 'Excellent Match', color: 'green', icon: '🎯' }
  if (score >= 60) return { label: 'Good Match', color: 'blue', icon: '✅' }
  if (score >= 40) return { label: 'Fair Match', color: 'yellow', icon: '⚠️' }
  return { label: 'Poor Match', color: 'red', icon: '❌' }
}
