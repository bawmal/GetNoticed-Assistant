# 🛠️ AI Career Assistant - Complete Setup Guide

This guide will walk you through setting up the AI Career Assistant from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18 or higher installed ([Download](https://nodejs.org/))
- [ ] npm or yarn package manager
- [ ] A Supabase account ([Sign up free](https://supabase.com))
- [ ] A Google AI Studio account ([Get API key](https://aistudio.google.com/app/apikey))
- [ ] A code editor (VS Code recommended)
- [ ] Git (optional, for version control)

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd ai-career-assistant
npm install
```

This will install all required packages:
- React & React DOM
- React Router
- Supabase JS client
- Google Generative AI SDK
- Tailwind CSS
- Lucide React icons
- And more...

**Expected time**: 2-3 minutes

---

### Step 2: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Select or create one
   - Name: `ai-career-assistant` (or your choice)
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to you
   - Pricing Plan: Free tier is perfect for MVP
4. **Click "Create new project"**
5. **Wait 2-3 minutes** for project to initialize

---

### Step 3: Set Up Database Schema

1. **In your Supabase dashboard**, go to **SQL Editor** (left sidebar)
2. **Click "New Query"**
3. **Copy the entire contents** of `supabase-schema.sql` from the project
4. **Paste into the SQL editor**
5. **Click "Run"** (or press Cmd/Ctrl + Enter)
6. **Verify success**: You should see "Success. No rows returned"

**What this creates:**
- `user_profiles` table
- `applications` table
- `user_settings` table
- Row Level Security (RLS) policies
- Storage bucket for user files
- Automatic timestamp triggers

---

### Step 4: Verify Database Setup

1. **Go to Table Editor** (left sidebar)
2. **You should see 3 tables:**
   - `user_profiles`
   - `applications`
   - `user_settings`
3. **Go to Storage** (left sidebar)
4. **You should see bucket:**
   - `user-assets`

If any are missing, re-run the SQL script.

---

### Step 5: Get Supabase Credentials

1. **Go to Settings > API** (left sidebar)
2. **Copy these values:**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

**⚠️ Important**: Use the `anon` key, NOT the `service_role` key!

---

### Step 6: Get Gemini API Key

1. **Go to [Google AI Studio](https://aistudio.google.com/app/apikey)**
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Select "Create API key in new project"** (or use existing)
5. **Copy the API key** (starts with `AIza...`)

**💡 Note**: Gemini 2.0 Flash has a generous free tier (15 requests/minute)

---

### Step 7: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Open `.env` in your editor**

3. **Fill in your credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Save the file**

**⚠️ Security**: Never commit `.env` to git! It's in `.gitignore` by default.

---

### Step 8: Enable Google OAuth (Optional)

If you want Google sign-in, follow these detailed steps:

#### Part A: Create Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Click "Select a project"** → **"New Project"**
3. **Enter project name**: `GetNoticed Auth` (or your choice)
4. **Click "Create"**
5. **Wait for project creation** (30 seconds)

#### Part B: Configure OAuth Consent Screen

1. **In Google Cloud Console**, go to **APIs & Services > OAuth consent screen**
2. **Select "External"** user type → **Click "Create"**
3. **Fill in App Information:**
   - App name: `GetNoticed`
   - User support email: Your email
   - Developer contact: Your email
4. **Click "Save and Continue"**
5. **Scopes**: Click "Save and Continue" (no changes needed)
6. **Test users**: Click "Save and Continue" (optional)
7. **Click "Back to Dashboard"**

#### Part C: Create OAuth Credentials

1. **Go to APIs & Services > Credentials**
2. **Click "Create Credentials"** → **"OAuth client ID"**
3. **Application type**: Select **"Web application"**
4. **Name**: `GetNoticed Web Client`
5. **Authorized JavaScript origins**: Add:
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs**: Add:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   ⚠️ Replace `YOUR-PROJECT-ID` with your actual Supabase project ID
   
7. **Click "Create"**
8. **Copy the Client ID and Client Secret** (you'll need these!)

#### Part D: Configure Supabase

1. **In Supabase dashboard**, go to **Authentication > Providers**
2. **Find "Google"** and toggle it **ON**
3. **Paste your credentials:**
   - Client ID: (from Google Cloud)
   - Client Secret: (from Google Cloud)
4. **Click "Save"**

#### Part E: Add Production URLs (When Deploying)

When you deploy to production, add your production URL to Google Cloud:

1. **Go back to Google Cloud Console > Credentials**
2. **Click your OAuth client**
3. **Add to Authorized JavaScript origins:**
   ```
   https://yourdomain.com
   ```
4. **Add to Authorized redirect URIs:**
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
5. **Click "Save"**

**✅ Test Google Sign-In:**
- Click "Continue with Google" on login page
- You should be redirected to Google
- After signing in, you'll be redirected back to your app

**Skip this entire step if you only want email/password auth**

---

### Step 9: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v5.4.2  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Open your browser** to [http://localhost:3000](http://localhost:3000)

---

### Step 10: Test the Application

#### Create Your First Account

1. **Click "Get Started Free"** or **"Sign In"**
2. **Click "Sign Up"** tab
3. **Enter email and password** (min 6 characters)
4. **Click "Sign Up"**
5. **Check your email** for confirmation link
6. **Click the link** to verify your account
7. **You'll be redirected to the dashboard**

#### Upload Your CV

1. **You'll see a prompt** to set up your profile
2. **Click "Upload CV & Create Profile"**
3. **Enter a profile name** (e.g., "Software Engineer")
4. **Paste your CV text** into the textarea
5. **Click "Create Profile"**
6. **Wait 10-15 seconds** for AI to parse your CV
7. **You'll be redirected** to the dashboard

#### Create Your First Application

1. **Click "New Application"** button
2. **Enter job details:**
   - Job Title: "Senior Software Engineer"
   - Company Name: "Google"
   - Job Description: (paste a real job description)
3. **Click "Analyze Job Fit"**
4. **Wait 10-15 seconds** for AI analysis
5. **Review your match score** and insights
6. **Click "Generate Application Materials"**
7. **Wait 30-45 seconds** for all documents to generate
8. **Review generated documents:**
   - Tailored Resume
   - Cover Letter
   - Strategic Brief (with 90-day plan!)
9. **Click "Save Application"**

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Application loads at `http://localhost:3000`
- [ ] Landing page displays correctly
- [ ] Can create account with email/password
- [ ] Receive confirmation email
- [ ] Can log in after confirming
- [ ] Dashboard loads without errors
- [ ] Can create a profile with CV text
- [ ] AI successfully parses CV (check browser console for errors)
- [ ] Can analyze a job posting
- [ ] Match score displays (0-100%)
- [ ] Can generate all documents (resume, cover letter, brief)
- [ ] Can save application
- [ ] Can view saved application
- [ ] Can change application status
- [ ] Can log out and log back in

---

## 🐛 Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Solution:**
1. Check `.env` file exists in project root
2. Verify variable names start with `VITE_`
3. Restart dev server: `Ctrl+C` then `npm run dev`

---

### Issue: "Failed to parse CV content"

**Possible causes:**
1. **Invalid Gemini API key**
   - Verify key at [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Check for typos in `.env`
2. **API quota exceeded**
   - Check usage at Google AI Studio
   - Free tier: 15 requests/minute
3. **CV text too long**
   - Try with a shorter CV first
   - Gemini has input token limits

**Solution:**
- Check browser console (F12) for detailed error
- Try with sample CV text first
- Verify API key works with a simple test

---

### Issue: "Not authenticated" or "User not found"

**Solution:**
1. Clear browser cookies and cache
2. Sign out completely
3. Sign in again
4. Check Supabase dashboard > Authentication > Users
5. Verify your user exists

---

### Issue: Database/RLS errors

**Symptoms:**
- "permission denied for table user_profiles"
- "new row violates row-level security policy"

**Solution:**
1. Go to Supabase SQL Editor
2. Re-run the entire `supabase-schema.sql`
3. Verify RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```
4. All tables should show `rowsecurity = true`

---

### Issue: "Failed to upload file"

**Solution:**
1. Check Storage bucket exists: Supabase > Storage
2. Verify bucket name is `user-assets`
3. Check storage policies were created
4. Try creating bucket manually if missing

---

### Issue: Slow AI responses

**This is normal!** AI generation takes time:
- CV Parsing: 10-15 seconds
- Job Analysis: 10-15 seconds
- Document Generation: 30-45 seconds (3 documents in parallel)

**Tips:**
- Use Gemini 2.0 Flash (fastest model)
- Ensure good internet connection
- Check Google AI Studio for service status

---

### Issue: "Can't sign up with Google" / Google OAuth not working

**Common causes:**

1. **Google OAuth not enabled in Supabase**
   - Go to Supabase > Authentication > Providers
   - Make sure Google is toggled ON
   - Verify Client ID and Secret are entered

2. **Wrong redirect URI**
   - In Google Cloud Console, check redirect URI is:
     ```
     https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
     ```
   - Must match EXACTLY (no trailing slash)

3. **Missing localhost in authorized origins**
   - In Google Cloud Console > Credentials
   - Add `http://localhost:3000` to Authorized JavaScript origins

4. **OAuth consent screen not configured**
   - Complete all steps in Part B of Step 8
   - Make sure app is in "Testing" or "Published" status

5. **Browser blocking cookies**
   - Check browser allows third-party cookies
   - Try in incognito/private mode
   - Clear browser cache and cookies

**Quick fix:**
1. Delete and recreate OAuth credentials in Google Cloud
2. Update credentials in Supabase
3. Wait 5 minutes for changes to propagate
4. Try again

**Alternative:** Use email/password authentication instead (always works!)

---

## 🔧 Development Tips

### Hot Reload
Vite provides instant hot reload. Changes to code appear immediately without refresh.

### Browser DevTools
- Press `F12` to open DevTools
- Check Console for errors
- Check Network tab for API calls
- Check Application > Local Storage for Supabase session

### Database Inspection
Use Supabase Table Editor to view data in real-time:
- See parsed CV data in `user_profiles.master_experience`
- View generated documents in `applications.drafts`

### Testing Different Profiles
Create multiple profiles to test different career paths:
1. "Software Engineer" profile
2. "Product Manager" profile
3. "Data Scientist" profile

Each generates different tailored content!

---

## 📚 Next Steps

Once everything is working:

1. **Customize the UI** - Edit Tailwind colors in `tailwind.config.js`
2. **Add your own prompts** - Modify AI prompts in `src/lib/gemini.js`
3. **Extend functionality** - Add Stage 2 features (see roadmap)
4. **Deploy to production** - Use Netlify, Vercel, or Cloudflare Pages

---

## 🆘 Still Having Issues?

1. **Check browser console** for error messages
2. **Check Supabase logs** in dashboard
3. **Verify all environment variables** are set correctly
4. **Try with a fresh Supabase project**
5. **Create an issue** on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser and OS version

---

## 🎉 Success!

If you've completed all steps, you now have a fully functional AI Career Assistant!

**What you can do:**
- Upload multiple CVs for different career paths
- Analyze unlimited job postings
- Generate tailored application materials instantly
- Track all your applications in one place
- Export documents (coming in Stage 2)

**Happy job hunting! 🚀**
