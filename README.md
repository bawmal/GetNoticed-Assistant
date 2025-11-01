# 🚀 AI Career Assistant

An intelligent job application platform powered by **Gemini 2.5 Flash** that transforms your CV into tailored, strategic application materials in minutes.

## ✨ Features (MVP - Stage 1)

### Core Modules
- **📄 CV Upload & Parsing** - Upload your CV once, AI extracts and structures your experience
- **🎯 Job Fit Analysis** - Get instant match scores (0-100%) with detailed strengths/gaps analysis
- **📝 Tailored Resume Generator** - Auto-generate ATS-optimized resumes for each job
- **✉️ Cover Letter Generator** - Create personalized, compelling cover letters
- **💼 Strategic Job Brief** - Stand out with 90-day plans, case studies, and KPIs (MVP Core Feature)

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI Engine**: Google Gemini 2.5 Flash
- **Icons**: Lucide React
- **Routing**: React Router v6

## 🏗️ Project Structure

```
ai-career-assistant/
├── src/
│   ├── components/
│   │   └── Layout.jsx           # Main app layout with sidebar
│   ├── pages/
│   │   ├── Landing.jsx          # Public landing page
│   │   ├── Login.jsx            # Auth (email/password + Google OAuth)
│   │   ├── Dashboard.jsx        # Application overview & stats
│   │   ├── ProfileSetup.jsx     # CV upload & profile management
│   │   ├── JobAnalysis.jsx      # Job intake & document generation
│   │   └── ApplicationView.jsx  # View saved application materials
│   ├── lib/
│   │   ├── supabase.js          # Supabase client & helper functions
│   │   └── gemini.js            # Gemini AI service (all modules)
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind + custom styles
├── supabase-schema.sql          # Database schema (run in Supabase)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Google AI Studio account for Gemini API key

### 1. Clone and Install

```bash
cd ai-career-assistant
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the entire `supabase-schema.sql` file
3. Go to Storage and verify the `user-assets` bucket was created
4. Copy your project URL and anon key from Settings > API

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Tables

**user_profiles** - Multiple career profiles per user
- `id` (UUID, PK)
- `user_id` (FK to auth.users)
- `profile_name` (e.g., "Software Engineer", "Product Manager")
- `master_cv_path` (file path in storage)
- `is_primary` (boolean)
- `master_experience` (JSON - parsed CV data)
- `skills` (JSONB array)
- `photo_url` (optional)

**applications** - Job-specific artifacts
- `id` (UUID, PK)
- `user_id` (FK)
- `profile_id` (FK)
- `job_title`, `company_name`, `job_description`, `job_url`
- `match_score` (0-100)
- `status` (draft, applied, interviewing, rejected, accepted)
- `drafts` (JSONB - stores resume, cover_letter, brief)
- `notes`, `applied_at`

**user_settings** - Persistent user preferences
- `user_id` (PK/FK)
- `language`, `default_ai_model`
- `auto_apply_criteria` (JSONB - for Stage 3)
- `notifications_enabled`

### Storage Buckets
- `user-assets` - CVs, profile photos, exported documents

## 🎯 User Flow

### First-Time User
1. **Sign Up** → Email/password or Google OAuth
2. **Profile Setup** → Upload CV, AI parses it automatically
3. **Dashboard** → See empty state, prompted to create first application

### Creating an Application
1. **Job Analysis Page** → Paste job description
2. **AI Analysis** → Get match score, strengths, gaps, recommendations
3. **Generate Documents** → AI creates resume, cover letter, strategic brief
4. **Save & Review** → View all materials, export as needed

### Managing Applications
- **Dashboard** → Track all applications with stats
- **Application View** → Review documents, update status, export PDFs
- **Profile Management** → Edit profiles, add new career paths

## 🤖 AI Modules (Gemini Service)

### Module 1: CV Parsing
```javascript
geminiService.parseCVContent(cvText)
```
Extracts structured data: personal info, experience, education, skills, projects

### Module 2: Job Fit Analysis
```javascript
geminiService.analyzeJobFit(jobDescription, userProfile)
```
Returns: match_score, strengths, gaps, recommendations, requirements analysis

### Module 3: Tailored Resume
```javascript
geminiService.generateTailoredResume(jobDescription, userProfile, analysis)
```
Creates ATS-optimized resume with relevant keywords and achievements

### Module 4: Cover Letter
```javascript
geminiService.generateCoverLetter(jobDescription, companyName, userProfile, analysis)
```
Generates personalized cover letter with strong opening and value proposition

### Module 8: Strategic Brief (MVP Core)
```javascript
geminiService.generateStrategicBrief(jobDescription, companyName, userProfile, analysis)
```
Creates comprehensive brief with:
- Case study (problem, solution, results)
- 90-day plan (30/60/90 day milestones)
- KPIs (measurable goals)
- Value proposition
- Risk mitigation strategies

## 🎨 Design System

### Colors
- **Primary**: Blue (`primary-600` = #0284c7)
- **Accent**: Purple (`accent-600` = #c026d3)
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red

### Typography
- **Display**: Poppins (headings)
- **Body**: Inter (text)

### Components
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.card` - Content card with shadow
- `.input-field` - Form input
- `.label` - Form label

## 🔐 Authentication & Security

- **Supabase Auth** handles all authentication
- **Row Level Security (RLS)** ensures users only see their own data
- **Storage policies** protect user files
- **Environment variables** keep API keys secure

## 📈 Roadmap

### Stage 2: Growth & Strategic Depth
- [ ] Multiple profile management UI
- [ ] Master document editing
- [ ] Application strategy generator (Module 5)
- [ ] Interview Q&A generator (Module 7)
- [ ] Mock interview assistant (Module 9)
- [ ] Asset management (photos, documents)

### Stage 3: Automation & Scale
- [ ] Auto-apply agent (Module 2 enhancement)
- [ ] Follow-up email templates (Module 6)
- [ ] Real-time interview helper (Electron app)
- [ ] Full Supabase Storage integration
- [ ] PDF export functionality
- [ ] Analytics dashboard

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists and has correct values
- Restart dev server after changing `.env`

### "Failed to parse CV content"
- Gemini API key might be invalid
- Check API quota at Google AI Studio
- Try pasting CV text directly instead of uploading file

### "Not authenticated" errors
- Clear browser cache and cookies
- Sign out and sign back in
- Check Supabase project is active

### Database errors
- Verify `supabase-schema.sql` was run completely
- Check RLS policies are enabled
- Ensure user is authenticated

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Open an issue or submit a PR.

## 📄 License

MIT License - feel free to use this for your own job search!

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for amazing backend infrastructure
- **Tailwind CSS** for beautiful, rapid styling
- **Lucide** for clean, consistent icons

---

**Built with ❤️ to help job seekers land their dream roles**

Need help? Check the issues or create a new one!
