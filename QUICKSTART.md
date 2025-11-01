# ⚡ Quick Start Guide - AI Career Assistant

Get up and running in **15 minutes**!

## 📋 Pre-Flight Checklist

Before you begin, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] A Supabase account (free)
- [ ] A Google AI Studio account (free)
- [ ] 15 minutes of time

---

## 🚀 5-Step Setup

### Step 1: Install Dependencies (2 min)

```bash
cd ai-career-assistant
npm install
```

Wait for installation to complete (~2 minutes).

---

### Step 2: Set Up Supabase (5 min)

1. **Go to [supabase.com](https://supabase.com)** → Sign in → New Project
2. **Create project:**
   - Name: `ai-career-assistant`
   - Password: (generate and save)
   - Region: (closest to you)
3. **Wait 2-3 minutes** for project to initialize
4. **Go to SQL Editor** → New Query
5. **Copy/paste entire `supabase-schema.sql`** → Run
6. **Go to Settings > API** → Copy:
   - Project URL
   - anon/public key

---

### Step 3: Get Gemini API Key (2 min)

1. **Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. **Sign in** with Google
3. **Create API Key** → Copy it

---

### Step 4: Configure Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_GEMINI_API_KEY=AIzaSy...
```

---

### Step 5: Start Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Test Your Setup

### Create Account & Test Features

1. **Sign Up** → Enter email/password → Confirm email
2. **Create Profile** → Paste CV text → Wait for AI parsing
3. **New Application** → Paste job description → Analyze
4. **Generate Documents** → Wait 30-45 seconds
5. **View Results** → Check resume, cover letter, strategic brief

**If all steps work → You're ready! 🎉**

---

## 🐛 Quick Troubleshooting

### Error: "Missing environment variables"
→ Check `.env` file exists and has all 3 variables
→ Restart dev server

### Error: "Failed to parse CV"
→ Check Gemini API key is correct
→ Try shorter CV text first

### Error: "Not authenticated"
→ Clear browser cache
→ Sign out and back in

### Database errors
→ Re-run `supabase-schema.sql`
→ Check Supabase project is active

---

## 📚 Next Steps

Once everything works:

1. **Read `README.md`** for full feature overview
2. **Check `SETUP_GUIDE.md`** for detailed explanations
3. **Review `ARCHITECTURE.md`** to understand the system
4. **Customize** colors in `tailwind.config.js`
5. **Deploy** to Netlify/Vercel when ready

---

## 🎯 Key Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 💡 Pro Tips

- **Use real CV text** for best AI results
- **Paste complete job descriptions** for accurate analysis
- **Create multiple profiles** for different career paths
- **Check browser console** if something doesn't work
- **Supabase Table Editor** shows your data in real-time

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Review `SETUP_GUIDE.md` for detailed steps
3. Verify all environment variables are set
4. Check Supabase logs in dashboard

---

**Ready to transform your job search! 🚀**
