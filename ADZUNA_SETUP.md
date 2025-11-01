# Adzuna API Setup (FREE Alternative) 🆓

## Why Adzuna?

- ✅ **Truly FREE** - No credit card required
- ✅ **1000 calls/month** - 10x more than JSearch free tier
- ✅ **Multiple sources** - Aggregates from many job boards
- ✅ **Includes LinkedIn jobs** - Through their aggregation
- ✅ **Instant approval** - No waiting

---

## Quick Setup (3 minutes)

### Step 1: Sign Up

1. Go to: https://developer.adzuna.com/
2. Click **"Sign Up"**
3. Fill in:
   - Email
   - Password
   - Name
   - Company (can be "Personal Project")
4. Click **"Create Account"**

### Step 2: Get API Credentials

1. After signup, you'll see your dashboard
2. Copy two values:
   - **Application ID** (app_id)
   - **Application Key** (app_key)

### Step 3: Add to Environment

```bash
# .env.local
VITE_ADZUNA_APP_ID=your_app_id_here
VITE_ADZUNA_APP_KEY=your_app_key_here
```

### Step 4: Test

```bash
npm run dev
# Jobs will now come from Adzuna!
```

---

## Free Tier Limits

```
Calls per month: 1,000
Jobs per call: 10
Total jobs: 10,000/month
Cost: $0

With 85% cache hit rate:
- Support 6,000+ user searches/month
- Still FREE!
```

---

## Comparison: JSearch vs Adzuna

| Feature | JSearch | Adzuna |
|---------|---------|--------|
| **Free Tier** | 100 calls | 1,000 calls |
| **Credit Card** | Required | Not required |
| **Approval** | Instant | Instant |
| **Sources** | 6+ boards | Multiple boards |
| **LinkedIn** | Direct | Aggregated |
| **Best For** | Premium users | Free tier users |

---

## Recommendation

**Start with Adzuna** (free, no card) → **Upgrade to JSearch later** (better data)

This way you can:
1. Launch immediately with Adzuna
2. Test your app with real users
3. Upgrade to JSearch when you have revenue
4. Or use both for maximum coverage!
