/**
 * CV-Based Job Matching V2
 * Evidence-based matching with specific examples and detailed analysis
 */

/**
 * Calculate detailed CV-based match with evidence
 * @param {Object} userProfile - User's profile with CV data
 * @param {Object} job - Job posting
 * @returns {Object} Detailed match analysis with evidence
 */
export function calculateCVMatchWithEvidence(userProfile, job) {
  const analysis = {
    matchPercentage: 0,
    requirementsMet: [],
    skillGaps: [],
    strengthAreas: [],
    evidenceFromResume: [],
    breakdown: {
      skills: { score: 0, max: 40, met: [], missing: [] },
      experience: { score: 0, max: 30, evidence: [] },
      title: { score: 0, max: 20, evidence: [] },
      keywords: { score: 0, max: 10, matches: [] }
    }
  }
  
  if (!userProfile || !job) {
    return analysis
  }
  
  // Parse user data
  const userSkills = parseSkills(userProfile.skills)
  const userExperience = parseExperience(userProfile.master_experience)
  const jobTitle = job.title || ''
  const jobDescription = job.description || ''
  
  console.log('🔍 CV Matcher - User Experience Length:', userExperience.length)
  console.log('🔍 CV Matcher - User Skills:', userSkills.length)
  console.log('🔍 CV Matcher - User Experience Sample:', userExperience.substring(0, 200))
  
  // 1. SKILLS ANALYSIS (40 points)
  const skillsAnalysis = analyzeSkills(userSkills, jobDescription, userExperience)
  analysis.breakdown.skills = skillsAnalysis
  
  console.log('📊 Skills Analysis:', {
    score: skillsAnalysis.score,
    met: skillsAnalysis.met.length,
    missing: skillsAnalysis.missing.length
  })
  
  // Add to requirements met/gaps
  skillsAnalysis.met.forEach(skill => {
    analysis.requirementsMet.push({
      category: 'Technical Skill',
      requirement: skill.name,
      evidence: skill.evidence,
      importance: 'high'
    })
  })
  
  skillsAnalysis.missing.forEach(skill => {
    analysis.skillGaps.push({
      skill: skill.name,
      importance: skill.importance,
      suggestion: `Consider adding ${skill.name} to your skillset`
    })
  })
  
  // 2. EXPERIENCE ANALYSIS (30 points)
  const experienceAnalysis = analyzeExperience(userExperience, jobTitle, jobDescription)
  analysis.breakdown.experience = experienceAnalysis
  
  experienceAnalysis.evidence.forEach(ev => {
    analysis.evidenceFromResume.push(ev)
    if (ev.matches) {
      analysis.requirementsMet.push({
        category: 'Experience',
        requirement: ev.requirement,
        evidence: ev.text,
        importance: 'high'
      })
    }
  })
  
  // 3. TITLE/ROLE ANALYSIS (20 points)
  const titleAnalysis = analyzeTitleMatch(userExperience, jobTitle)
  analysis.breakdown.title = titleAnalysis
  
  if (titleAnalysis.evidence.length > 0) {
    titleAnalysis.evidence.forEach(ev => {
      analysis.requirementsMet.push({
        category: 'Role Experience',
        requirement: ev.requirement,
        evidence: ev.text,
        importance: 'critical'
      })
    })
  }
  
  // 4. KEYWORD ANALYSIS (10 points)
  const keywordAnalysis = analyzeKeywords(userExperience, jobDescription)
  analysis.breakdown.keywords = keywordAnalysis
  
  // Calculate total score
  const totalScore = 
    skillsAnalysis.score +
    experienceAnalysis.score +
    titleAnalysis.score +
    keywordAnalysis.score
  
  analysis.matchPercentage = Math.min(100, Math.round(totalScore))
  
  // Identify strength areas
  if (skillsAnalysis.score >= 30) {
    analysis.strengthAreas.push('Strong technical skills match')
  }
  if (experienceAnalysis.score >= 20) {
    analysis.strengthAreas.push('Relevant experience level')
  }
  if (titleAnalysis.score >= 15) {
    analysis.strengthAreas.push('Direct role experience')
  }
  
  return analysis
}

/**
 * Analyze skills with evidence
 */
function analyzeSkills(userSkills, jobDescription, userExperience) {
  const result = {
    score: 0,
    max: 40,
    met: [],
    missing: []
  }
  
  const descLower = jobDescription.toLowerCase()
  const expLower = userExperience.toLowerCase()
  
  // Extract required skills from job description
  const requiredSkills = extractRequiredSkills(jobDescription)
  
  // Check each required skill
  requiredSkills.forEach(reqSkill => {
    const skillLower = reqSkill.name.toLowerCase()
    const hasSkill = userSkills.some(us => us.toLowerCase() === skillLower)
    
    if (hasSkill) {
      // Find evidence in experience
      const evidence = findSkillEvidence(skillLower, userExperience)
      result.met.push({
        name: reqSkill.name,
        evidence: evidence || `Listed in skills: ${reqSkill.name}`,
        importance: reqSkill.importance
      })
    } else {
      result.missing.push({
        name: reqSkill.name,
        importance: reqSkill.importance
      })
    }
  })
  
  // Calculate score based on critical and important skills
  const criticalMet = result.met.filter(s => s.importance === 'critical').length
  const criticalTotal = requiredSkills.filter(s => s.importance === 'critical').length
  const importantMet = result.met.filter(s => s.importance === 'important').length
  const importantTotal = requiredSkills.filter(s => s.importance === 'important').length
  
  // Critical skills worth 60%, important skills worth 40%
  const criticalScore = criticalTotal > 0 ? (criticalMet / criticalTotal) * 24 : 24
  const importantScore = importantTotal > 0 ? (importantMet / importantTotal) * 16 : 16
  
  result.score = Math.round(criticalScore + importantScore)
  
  return result
}

/**
 * Extract required skills from job description
 */
function extractRequiredSkills(jobDescription) {
  const skills = []
  const descLower = jobDescription.toLowerCase()
  
  // Critical technical skills (must-haves)
  const criticalSkills = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'aws', 'kubernetes',
    'sql', 'postgresql', 'mongodb', 'machine learning', 'data science', 'product management',
    'agile', 'scrum'
  ]
  
  // Important skills (nice-to-haves)
  const importantSkills = [
    'docker', 'terraform', 'ci/cd', 'git', 'rest api', 'graphql', 'redis', 'elasticsearch',
    'vue', 'angular', 'django', 'flask', 'spring', 'microservices', 'cloud', 'devops'
  ]
  
  criticalSkills.forEach(skill => {
    if (descLower.includes(skill)) {
      skills.push({ name: skill, importance: 'critical' })
    }
  })
  
  importantSkills.forEach(skill => {
    if (descLower.includes(skill)) {
      skills.push({ name: skill, importance: 'important' })
    }
  })
  
  return skills
}

/**
 * Find evidence of skill usage in experience
 */
function findSkillEvidence(skill, userExperience) {
  const lines = userExperience.split('\n')
  const skillLower = skill.toLowerCase()
  
  // Find lines that mention the skill
  for (const line of lines) {
    const lineLower = line.toLowerCase()
    if (lineLower.includes(skillLower) && line.length > 20) {
      // Return a snippet of the line
      return line.trim().substring(0, 150) + (line.length > 150 ? '...' : '')
    }
  }
  
  return null
}

/**
 * Analyze experience with evidence
 */
function analyzeExperience(userExperience, jobTitle, jobDescription) {
  const result = {
    score: 0,
    max: 30,
    evidence: []
  }
  
  const expLower = userExperience.toLowerCase()
  const titleLower = jobTitle.toLowerCase()
  const descLower = jobDescription.toLowerCase()
  
  // 1. Check seniority level (20 points)
  const seniorityResult = checkSeniority(userExperience, jobTitle)
  result.score += seniorityResult.score
  if (seniorityResult.evidence) {
    result.evidence.push(seniorityResult.evidence)
  }
  
  // 2. Check years of experience (5 points)
  const yearsResult = checkYearsOfExperience(userExperience, jobDescription)
  result.score += yearsResult.score
  if (yearsResult.evidence) {
    result.evidence.push(yearsResult.evidence)
  }
  
  // 3. Check industry experience (5 points)
  const industryResult = checkIndustryExperience(userExperience, jobDescription)
  result.score += industryResult.score
  if (industryResult.evidence) {
    result.evidence.push(industryResult.evidence)
  }
  
  return result
}

/**
 * Check seniority level match
 */
function checkSeniority(userExperience, jobTitle) {
  const expLower = userExperience.toLowerCase()
  const titleLower = jobTitle.toLowerCase()
  
  const seniorityMap = {
    'senior': ['senior', 'sr', 'sr.', 'lead', 'group', 'staff', 'principal'],
    'lead': ['lead', 'senior', 'sr', 'group', 'staff'],
    'group': ['group', 'senior', 'sr', 'lead', 'staff'],
    'staff': ['staff', 'senior', 'principal'],
    'principal': ['principal', 'staff', 'senior'],
    'junior': ['junior', 'jr', 'associate', 'entry'],
    'mid': ['mid', 'intermediate']
  }
  
  // Find job seniority
  let jobSeniority = null
  for (const level of Object.keys(seniorityMap)) {
    if (titleLower.includes(level)) {
      jobSeniority = level
      break
    }
  }
  
  if (!jobSeniority) {
    return { score: 15, evidence: null } // No specific seniority required
  }
  
  // Check if user has equivalent seniority
  const equivalents = seniorityMap[jobSeniority]
  for (const equiv of equivalents) {
    if (expLower.includes(equiv)) {
      // Find evidence
      const lines = userExperience.split('\n')
      for (const line of lines) {
        if (line.toLowerCase().includes(equiv) && line.length > 10) {
          return {
            score: 20,
            evidence: {
              requirement: `${jobSeniority.charAt(0).toUpperCase() + jobSeniority.slice(1)}-level experience`,
              text: line.trim().substring(0, 100),
              matches: true
            }
          }
        }
      }
      return { score: 20, evidence: null }
    }
  }
  
  return {
    score: 5,
    evidence: {
      requirement: `${jobSeniority.charAt(0).toUpperCase() + jobSeniority.slice(1)}-level experience`,
      text: 'Different seniority level in experience',
      matches: false
    }
  }
}

/**
 * Check years of experience
 */
function checkYearsOfExperience(userExperience, jobDescription) {
  const descLower = jobDescription.toLowerCase()
  const yearsMatch = descLower.match(/(\d+)\+?\s*years?/i)
  
  if (!yearsMatch) {
    return { score: 5, evidence: null }
  }
  
  const requiredYears = parseInt(yearsMatch[1])
  const userYears = estimateYears(userExperience)
  
  if (userYears >= requiredYears) {
    return {
      score: 5,
      evidence: {
        requirement: `${requiredYears}+ years of experience`,
        text: `Approximately ${userYears} years of relevant experience`,
        matches: true
      }
    }
  }
  
  return {
    score: 2,
    evidence: {
      requirement: `${requiredYears}+ years of experience`,
      text: `Approximately ${userYears} years of experience`,
      matches: false
    }
  }
}

/**
 * Estimate years of experience
 */
function estimateYears(cvText) {
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
 * Check industry experience
 */
function checkIndustryExperience(userExperience, jobDescription) {
  const expLower = userExperience.toLowerCase()
  const descLower = jobDescription.toLowerCase()
  
  const industries = ['fintech', 'healthcare', 'e-commerce', 'saas', 'b2b', 'b2c', 'enterprise', 'startup']
  
  for (const industry of industries) {
    if (descLower.includes(industry) && expLower.includes(industry)) {
      return {
        score: 5,
        evidence: {
          requirement: `${industry.charAt(0).toUpperCase() + industry.slice(1)} experience`,
          text: `Has ${industry} industry experience`,
          matches: true
        }
      }
    }
  }
  
  return { score: 0, evidence: null }
}

/**
 * Analyze title/role match
 */
function analyzeTitleMatch(userExperience, jobTitle) {
  const result = {
    score: 0,
    max: 20,
    evidence: []
  }
  
  const expLower = userExperience.toLowerCase()
  const titleLower = jobTitle.toLowerCase()
  
  const coreRoles = [
    'product manager', 'software engineer', 'data scientist', 'designer',
    'developer', 'analyst', 'engineer', 'architect'
  ]
  
  // Find core role in job title
  for (const role of coreRoles) {
    if (titleLower.includes(role) && expLower.includes(role)) {
      // Find evidence
      const lines = userExperience.split('\n')
      for (const line of lines) {
        if (line.toLowerCase().includes(role) && line.length > 10) {
          result.score = 20
          result.evidence.push({
            requirement: `${role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} experience`,
            text: line.trim().substring(0, 100),
            matches: true
          })
          return result
        }
      }
      result.score = 18
      return result
    }
  }
  
  result.score = 5
  return result
}

/**
 * Analyze keyword matches
 */
function analyzeKeywords(userExperience, jobDescription) {
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
  
  let matches = 0
  const matchedWords = []
  
  descWords.forEach(word => {
    if (expWords.has(word) && matchedWords.length < 10) {
      matches++
      matchedWords.push(word)
    }
  })
  
  const matchRatio = descWords.length > 0 ? matches / descWords.length : 0
  const score = Math.round(matchRatio * 10)
  
  return { score, max: 10, matches: matchedWords }
}

/**
 * Parse experience from JSON or text format
 */
function parseExperience(experience) {
  if (!experience) return ''
  
  // If it's already a string, return it
  if (typeof experience === 'string') {
    // Check if it's JSON
    if (experience.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(experience)
        return extractTextFromCV(parsed)
      } catch (e) {
        return experience
      }
    }
    return experience
  }
  
  // If it's an object, extract text
  if (typeof experience === 'object') {
    return extractTextFromCV(experience)
  }
  
  return ''
}

/**
 * Extract readable text from CV JSON structure
 */
function extractTextFromCV(cvData) {
  const parts = []
  
  // Extract work experience
  if (cvData.work_experience && Array.isArray(cvData.work_experience)) {
    cvData.work_experience.forEach(job => {
      if (job.title) parts.push(job.title)
      if (job.company) parts.push(job.company)
      if (job.description) parts.push(job.description)
      if (job.achievements && Array.isArray(job.achievements)) {
        parts.push(...job.achievements)
      }
    })
  }
  
  // Extract education
  if (cvData.education && Array.isArray(cvData.education)) {
    cvData.education.forEach(edu => {
      if (edu.degree) parts.push(edu.degree)
      if (edu.field) parts.push(edu.field)
      if (edu.school) parts.push(edu.school)
    })
  }
  
  // Extract skills
  if (cvData.skills) {
    if (Array.isArray(cvData.skills)) {
      parts.push(...cvData.skills)
    } else if (typeof cvData.skills === 'object') {
      Object.values(cvData.skills).forEach(skillGroup => {
        if (Array.isArray(skillGroup)) {
          parts.push(...skillGroup)
        }
      })
    }
  }
  
  // Extract summary/objective
  if (cvData.summary) parts.push(cvData.summary)
  if (cvData.objective) parts.push(cvData.objective)
  
  return parts.filter(p => p && typeof p === 'string').join('\n')
}

/**
 * Parse skills from various formats
 */
function parseSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.filter(s => s && typeof s === 'string')
  }
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }
  if (skills && typeof skills === 'object') {
    return Object.values(skills).filter(s => s && typeof s === 'string')
  }
  return []
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
