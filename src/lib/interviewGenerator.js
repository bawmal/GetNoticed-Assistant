import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Gemini API key not found. Interview generation will be disabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const getModel = () => {
  if (!genAI) throw new Error('Gemini API not initialized');
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp'
  });
};

// Utility function to clean markdown formatting from AI responses
function cleanMarkdown(text) {
  if (!text) return text;
  
  return text
    // Remove bold (**text** or __text__) but keep single asterisks for bullets
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove code blocks (```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`text`)
    .replace(/`(.+?)`/g, '$1')
    .trim();
}

export async function generateInterviewPrep(application, additionalMaterials = '') {
  if (!application) {
    throw new Error('Application data is required');
  }

  // Get user's CV from the application
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get profile data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single();

  if (!profile) throw new Error('Profile not found');

  const cvText = JSON.stringify(profile.master_experience || {});
  const jobDescription = application.job_description || '';
  const companyInfo = `${application.company_name} - ${application.location || 'Remote'}`;
  const jobTitle = application.job_title || '';

  // Step 1: Analyze profile
  const analyzedProfile = await analyzeProfile(cvText, jobDescription, companyInfo, additionalMaterials);

  // Step 2: Generate tailored introduction (2-3 minutes)
  const introQuestion = await generateIntroduction(cvText, jobDescription, companyInfo, jobTitle, analyzedProfile, additionalMaterials);

  // Step 3: Generate other questions
  const questions = await generateQuestions(analyzedProfile, jobDescription, companyInfo, cvText, additionalMaterials);

  // Step 4: Create responses
  const questionsWithResponses = await createResponses(questions, cvText, analyzedProfile);

  // Step 5: Generate STAR stories
  const starStories = await generateStarStories(cvText, analyzedProfile);

  // Step 6: Create 90-day plan
  const ninetyDayPlan = await create90DayPlan(jobDescription, companyInfo, analyzedProfile);

  // Step 7: Generate KPIs
  const kpis = await generateKPIs(jobDescription, companyInfo);

  return {
    analyzedProfile,
    questions: [introQuestion, ...questionsWithResponses], // Intro first!
    starStories,
    ninetyDayPlan,
    kpis
  };
}

async function analyzeProfile(cv, jobDescription, companyInfo, additionalMaterials) {
  const model = getModel();
  
  const additionalContext = additionalMaterials ? `

<additional_materials>
${additionalMaterials}
</additional_materials>` : '';
  
  const prompt = `Analyze the following CV and job description to identify the candidate's strengths, potential skill gaps, and relevant experiences for this role:

<cv>${cv}</cv>

<job_description>${jobDescription}</job_description>

<company_info>${companyInfo}</company_info>${additionalContext}

Provide a comprehensive analysis of how the candidate's background aligns with the job requirements, identifying both strengths to emphasize and areas that might need additional preparation.

Format your response as a clear, professional summary focusing on:
1. Key strengths and alignment
2. Relevant experiences
3. Areas to emphasize in interviews
4. Potential gaps to address

IMPORTANT: Use plain text only. Do NOT use markdown formatting (no asterisks, no bold, no italic).`;

  const result = await model.generateContent(prompt);
  return cleanMarkdown(result.response.text());
}

async function generateIntroduction(cv, jobDescription, companyInfo, jobTitle, analyzedProfile, additionalMaterials) {
  const model = getModel();
  
  const additionalContext = additionalMaterials ? `

<additional_materials>
${additionalMaterials}
</additional_materials>` : '';
  
  const prompt = `Create a compelling 2-3 minute introduction for an interview. This should be tailored specifically for the ${jobTitle} position at ${companyInfo}.

<cv>${cv}</cv>

<job_description>${jobDescription}</job_description>

<analysis>${analyzedProfile}</analysis>${additionalContext}

The introduction should:
1. Start with current role and key achievements
2. Highlight 2-3 most relevant experiences that align with THIS specific role
3. Show understanding of the company and why you're interested
4. End with enthusiasm about the opportunity
5. Be conversational and natural (not robotic)
6. Take approximately 2-3 minutes to deliver

IMPORTANT: Write this as a first-person narrative that the candidate can deliver naturally. Use plain text only, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const response = cleanMarkdown(result.response.text());
  
  return {
    question: "Tell me about yourself / Walk me through your background",
    category: "Introduction",
    framework: "Present-Past-Future (Current role → Relevant experience → Why this role)",
    response: response,
    keyPoints: [
      "Tailor to the specific company and role",
      "Keep it to 2-3 minutes",
      "Focus on relevant achievements",
      "Show enthusiasm for the opportunity"
    ]
  };
}

async function generateQuestions(analyzedProfile, jobDescription, companyInfo, cv, additionalMaterials) {
  const model = getModel();
  
  const additionalContext = additionalMaterials ? `

<additional_materials>
${additionalMaterials}
</additional_materials>` : '';
  
  const prompt = `Based on the following analysis, job description, and CV, generate a list of 8-10 potential interview questions the candidate is likely to face. Include a mix of technical, behavioral, and role-specific questions. For each question, specify the category and recommend a framework for answering (STAR, RICE, etc.).

<analysis>${analyzedProfile}</analysis>

<job_description>${jobDescription}</job_description>

<company_info>${companyInfo}</company_info>${additionalContext}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Tell me about your experience with...",
    "category": "Technical Experience",
    "framework": "STAR (Situation, Task, Action, Result)"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no explanations.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  let jsonText = text;
  if (text.includes('```json')) {
    jsonText = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    jsonText = text.split('```')[1].split('```')[0].trim();
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse questions JSON:', error);
    return [
      {
        question: "Tell me about your most relevant experience for this role.",
        category: "Experience",
        framework: "STAR (Situation, Task, Action, Result)"
      },
      {
        question: "How do you prioritize features in a product roadmap?",
        category: "Product Strategy",
        framework: "RICE (Reach, Impact, Confidence, Effort)"
      }
    ];
  }
}

async function createResponses(questions, cv, analyzedProfile) {
  const model = getModel();
  
  const prompt = `Create detailed, tailored responses for each of the following potential interview questions. Each response should incorporate relevant experience from the CV and follow the recommended framework. Make responses 150-200 words each.

<cv>${cv}</cv>

<questions>${JSON.stringify(questions)}</questions>

<analysis>${analyzedProfile}</analysis>

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "[exact question from input]",
    "response": "[detailed response]",
    "keyPoints": ["point 1", "point 2", "point 3"]
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  let jsonText = text;
  if (text.includes('```json')) {
    jsonText = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    jsonText = text.split('```')[1].split('```')[0].trim();
  }
  
  try {
    const responses = JSON.parse(jsonText);
    return questions.map(q => {
      const response = responses.find(r => r.question === q.question);
      return {
        ...q,
        response: response?.response || 'Focus on specific examples that demonstrate your skills.',
        keyPoints: response?.keyPoints || []
      };
    });
  } catch (error) {
    console.error('Failed to parse responses JSON:', error);
    return questions.map(q => ({
      ...q,
      response: 'Based on your experience, provide specific examples.',
      keyPoints: ['Provide specific examples', 'Quantify your impact']
    }));
  }
}

async function generateStarStories(cv, analyzedProfile) {
  const model = getModel();
  
  const prompt = `Based on the CV and analysis, create 3 compelling STAR (Situation, Task, Action, Result) stories that highlight the candidate's relevant experience.

<cv>${cv}</cv>

<analysis>${analyzedProfile}</analysis>

For each story, provide comprehensive details:
- SITUATION: 3-4 sentences describing the context, challenges, and business environment. Include specific details about the company, team size, and stakes involved.
- TASK: 2-3 sentences explaining the specific objective, why it was important, and what success would look like.
- ACTION: 4-5 sentences detailing the specific steps taken, methodologies used, teams involved, and how you led or contributed. Include specific tools, frameworks, or approaches.
- RESULT: 3-4 sentences with quantifiable outcomes, business impact, and lessons learned. Include specific metrics and percentages.

Return ONLY a valid JSON array:
[
  {
    "title": "Compelling Story Title",
    "situation": "Detailed 3-4 sentence situation with context and stakes",
    "task": "Specific 2-3 sentence task with clear objectives",
    "action": "Comprehensive 4-5 sentence action with specific steps and methodologies",
    "result": "Detailed 3-4 sentence result with quantifiable metrics and impact"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  let jsonText = text;
  if (text.includes('```json')) {
    jsonText = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    jsonText = text.split('```')[1].split('```')[0].trim();
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return [{
      title: "Leading a Cross-Functional Project",
      situation: "Complex challenge requiring team coordination.",
      task: "Deliver critical project on time.",
      action: "Implemented agile methodologies.",
      result: "Delivered 2 weeks ahead with 95% satisfaction."
    }];
  }
}

async function create90DayPlan(jobDescription, companyInfo, analyzedProfile) {
  const model = getModel();
  
  const prompt = `Create a comprehensive 90-day plan for this role.

<job_description>${jobDescription}</job_description>

<company_info>${companyInfo}</company_info>

<analysis>${analyzedProfile}</analysis>

Format with:
- Overall Goals
- Days 1-30: Learning & Assessment
- Days 31-60: Strategy & Quick Wins
- Days 61-90: Execution
- Success Metrics

IMPORTANT: Use plain text only. Do NOT use markdown formatting (no asterisks, no bold, no italic).`;

  const result = await model.generateContent(prompt);
  return cleanMarkdown(result.response.text());
}

async function generateKPIs(jobDescription, companyInfo) {
  const model = getModel();
  
  const prompt = `Create relevant KPIs for this role.

<job_description>${jobDescription}</job_description>

<company_info>${companyInfo}</company_info>

Format with categories:
- Technical Performance Metrics
- User Engagement Metrics
- Business Impact Metrics

IMPORTANT: Use plain text only. Do NOT use markdown formatting (no asterisks, no bold, no italic).`;

  const result = await model.generateContent(prompt);
  return cleanMarkdown(result.response.text());
}