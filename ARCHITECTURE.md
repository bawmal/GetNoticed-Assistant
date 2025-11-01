# 🏗️ AI Career Assistant - Architecture Documentation

## System Overview

The AI Career Assistant is a **client-side React application** with **Supabase backend** and **Gemini AI** integration. This document explains the architectural decisions and data flow.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application (Vite)                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Pages      │  │  Components  │  │   Services   │ │ │
│  │  │  - Landing   │  │  - Layout    │  │  - Supabase  │ │ │
│  │  │  - Login     │  │  - Forms     │  │  - Gemini    │ │ │
│  │  │  - Dashboard │  │  - Cards     │  │              │ │ │
│  │  │  - Profile   │  │              │  │              │ │ │
│  │  │  - JobAnalys │  │              │  │              │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │    Auth      │  │   Storage    │      │
│  │  - Tables    │  │  - Email/PW  │  │  - CV Files  │      │
│  │  - RLS       │  │  - OAuth     │  │  - Assets    │      │
│  │  - Triggers  │  │  - Sessions  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE GEMINI AI                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Gemini 2.0 Flash Model                   │   │
│  │  - CV Parsing                                         │   │
│  │  - Job Analysis                                       │   │
│  │  - Document Generation                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **React 18**: UI framework with hooks
- **Vite**: Build tool (faster than CRA)
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Backend (Supabase)
- **PostgreSQL**: Relational database
- **PostgREST**: Auto-generated REST API
- **GoTrue**: Authentication service
- **Storage**: File storage with CDN

### AI Layer
- **Google Gemini 2.0 Flash**: LLM for all AI tasks
- **@google/generative-ai**: Official SDK

---

## Data Flow

### 1. User Authentication Flow

```
User → Login Page → Supabase Auth → JWT Token → Local Storage
                                        ↓
                                   User Session
                                        ↓
                              Protected Routes Accessible
```

**Key Points:**
- JWT stored in browser localStorage
- Auto-refresh on expiry
- RLS policies enforce data isolation

---

### 2. CV Upload & Parsing Flow

```
User uploads CV
    ↓
Extract text from file
    ↓
Send to Gemini API (parseCVContent)
    ↓
Receive structured JSON
    ↓
Upload file to Supabase Storage
    ↓
Save parsed data to user_profiles table
    ↓
Display success & redirect
```

**Data Transformation:**
```
Raw CV Text → Gemini → Structured JSON → PostgreSQL JSONB
```

---

### 3. Job Application Generation Flow

```
User pastes job description
    ↓
Step 1: Analyze Job Fit
    ├─ Send job + profile to Gemini
    ├─ Calculate match score (0-100)
    └─ Return strengths, gaps, recommendations
    ↓
Step 2: Generate Documents (Parallel)
    ├─ Generate Resume ─────┐
    ├─ Generate Cover Letter ┼─→ Promise.all()
    └─ Generate Brief ───────┘
    ↓
Step 3: Save to Database
    ├─ Create application record
    └─ Store all drafts in JSONB
    ↓
Display results & allow export
```

**Parallelization:**
All 3 documents generate simultaneously for speed (30-45s total vs 90s sequential)

---

## Database Schema Design

### Design Principles

1. **User Isolation**: RLS ensures users only see their data
2. **Flexibility**: JSONB for dynamic/nested data
3. **Scalability**: Indexed foreign keys for fast queries
4. **Auditability**: Timestamps on all records

### Entity Relationships

```
auth.users (Supabase managed)
    ↓ 1:N
user_profiles
    ├─ profile_name (e.g., "Software Engineer")
    ├─ master_experience (JSONB - parsed CV)
    └─ is_primary (boolean)
    ↓ 1:N
applications
    ├─ job_title, company_name
    ├─ match_score (integer 0-100)
    ├─ status (enum: draft, applied, etc.)
    └─ drafts (JSONB - all generated docs)

auth.users
    ↓ 1:1
user_settings
    ├─ default_ai_model
    └─ auto_apply_criteria (JSONB)
```

### Why JSONB?

**Advantages:**
- Store complex nested structures (CV data, generated docs)
- Query with PostgreSQL JSON operators
- No schema migrations for AI output changes
- Flexible for future enhancements

**Example:**
```json
{
  "analysis": {
    "match_score": 85,
    "strengths": ["..."],
    "gaps": ["..."]
  },
  "resume": {
    "summary": "...",
    "experience": [...]
  },
  "cover_letter": {...},
  "brief": {...}
}
```

---

## Security Architecture

### Row Level Security (RLS)

**All tables have RLS enabled:**

```sql
-- Example: user_profiles
CREATE POLICY "Users can view their own profiles"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);
```

**Benefits:**
- Database-level security (can't bypass in code)
- Automatic filtering of queries
- No accidental data leaks

### Storage Security

**Bucket policies:**
- Users can only access files in their own folder
- Folder structure: `{user_id}/{type}/{filename}`
- Private bucket (no public access)

### API Key Security

**Environment variables:**
- Never committed to git
- Only accessible server-side (Vite prefix `VITE_` for client)
- Rotatable without code changes

---

## AI Integration Architecture

### Gemini Service Design

**Single service file** (`src/lib/gemini.js`) with modular functions:

```javascript
geminiService = {
  parseCVContent(),      // Module 1
  analyzeJobFit(),       // Module 2
  generateTailoredResume(), // Module 3
  generateCoverLetter(), // Module 4
  generateStrategicBrief() // Module 8
}
```

**Why this design?**
- Centralized AI logic
- Easy to swap models (just change `getModel()`)
- Consistent error handling
- Mockable for testing

### Prompt Engineering Strategy

**Structured prompts:**
1. Clear role definition ("You are an expert...")
2. Specific output format (JSON schema)
3. Context provision (job description + profile)
4. Quality guidelines (ATS-friendly, quantified, etc.)
5. Output constraints ("Return ONLY valid JSON")

**Example:**
```javascript
const prompt = `You are an expert CV parser.
Extract structured information from the following CV text.

Return a JSON object with this exact structure:
{
  "personal_info": {...},
  "experience": [...],
  ...
}

CV Text:
${cvText}

Return ONLY valid JSON, no markdown formatting.`
```

---

## State Management

### Approach: React Hooks + Context (Minimal)

**No Redux/Zustand needed for MVP:**
- Component-level state with `useState`
- Supabase handles auth state globally
- Data fetched on-demand (no global cache)

**Why?**
- Simpler codebase
- Faster development
- Sufficient for current scale

**Future consideration:**
- Add React Query for caching if performance issues
- Add Zustand for complex global state (Stage 3)

---

## Performance Optimizations

### Current Optimizations

1. **Parallel AI Calls**: Generate 3 documents simultaneously
2. **Vite HMR**: Instant hot reload during development
3. **Tailwind JIT**: Only includes used CSS classes
4. **Code Splitting**: React Router lazy loading (future)
5. **Database Indexes**: Fast queries on foreign keys

### Future Optimizations (Stage 2+)

- [ ] React Query for data caching
- [ ] Lazy load pages with React.lazy()
- [ ] Optimize Gemini prompts (reduce tokens)
- [ ] Add loading skeletons
- [ ] Implement pagination for applications list
- [ ] Add service worker for offline support

---

## Error Handling Strategy

### Layers of Error Handling

1. **API Level** (Supabase/Gemini)
   ```javascript
   try {
     const result = await geminiService.parseCVContent(text)
   } catch (error) {
     console.error('AI Error:', error)
     setError('Failed to parse CV. Please try again.')
   }
   ```

2. **UI Level**
   - Display user-friendly error messages
   - Show retry buttons
   - Log technical details to console

3. **Database Level**
   - RLS policies prevent unauthorized access
   - Constraints prevent invalid data
   - Triggers maintain data integrity

---

## Deployment Architecture

### Recommended Stack

```
Frontend: Netlify / Vercel / Cloudflare Pages
    ↓
Backend: Supabase (managed)
    ↓
AI: Google Gemini (API)
```

**Why this stack?**
- **Netlify/Vercel**: Free tier, auto-deploy from Git, CDN
- **Supabase**: Free tier, managed DB, auto-scaling
- **Gemini**: Generous free tier, fast responses

### Environment Variables in Production

**Netlify/Vercel:**
1. Add env vars in dashboard
2. Prefix with `VITE_` for client-side access
3. Redeploy after changes

---

## Scalability Considerations

### Current Limits (Free Tier)

- **Supabase**: 500MB database, 1GB storage, 2GB bandwidth
- **Gemini**: 15 requests/minute, 1M tokens/day
- **Netlify**: 100GB bandwidth, 300 build minutes

### Scaling Strategy

**When to upgrade:**
- 100+ active users → Supabase Pro ($25/mo)
- 1000+ AI requests/day → Gemini paid tier
- Heavy traffic → Netlify Pro ($19/mo)

**Horizontal scaling:**
- Supabase auto-scales database
- Gemini handles load automatically
- CDN distributes static assets globally

---

## Testing Strategy (Future)

### Recommended Approach

1. **Unit Tests**: Vitest for utility functions
2. **Integration Tests**: Test Supabase queries
3. **E2E Tests**: Playwright for user flows
4. **AI Tests**: Mock Gemini responses

**Priority tests:**
- [ ] CV parsing accuracy
- [ ] Job analysis scoring
- [ ] Document generation quality
- [ ] Auth flows
- [ ] RLS policies

---

## Monitoring & Observability

### Current Approach

- **Browser Console**: Client-side errors
- **Supabase Logs**: Database queries, auth events
- **Google AI Studio**: API usage, quota

### Future Enhancements

- [ ] Sentry for error tracking
- [ ] PostHog for analytics
- [ ] Custom logging service
- [ ] Performance monitoring (Web Vitals)

---

## Conclusion

This architecture prioritizes:
1. **Simplicity**: Minimal dependencies, clear structure
2. **Security**: RLS, env vars, auth best practices
3. **Performance**: Parallel AI calls, optimized queries
4. **Scalability**: Managed services, horizontal scaling
5. **Maintainability**: Modular code, clear separation of concerns

**Next steps**: Implement Stage 2 features while maintaining these principles.
