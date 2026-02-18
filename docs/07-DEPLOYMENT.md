# 🚀 CrewTide – Deployment Guide

## Recommended: Deploy to Vercel (Free)

Vercel is the easiest way to deploy a Vite/React app. Free tier is very generous.

---

## Option A: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub
```bash
# Initialize git in your crewtide folder
git init
git add .
git commit -m "Initial CrewTide commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/crewtide.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your `crewtide` GitHub repository
4. Vercel auto-detects it as a Vite project

### Step 3: Add Environment Variables
In Vercel project settings → **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Step 4: Deploy
Click **"Deploy"**. In ~2 minutes, your site is live at:
```
https://crewtide.vercel.app
```

---

## Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Build the project
npm run build

# Deploy
vercel

# Follow the prompts. Add env vars when asked.
```

---

## After Deployment: Update Supabase Settings

### Update Site URL:
1. In Supabase → **Authentication → Settings**
2. Set **Site URL** to your Vercel URL:
   ```
   https://crewtide.vercel.app
   ```

### Add Redirect URL:
1. In **Authentication → URL Configuration → Redirect URLs**, add:
   ```
   https://crewtide.vercel.app/**
   ```

This ensures email auth redirects work correctly in production.

---

## Alternative: Netlify

```bash
npm run build
# Drag the `dist` folder to netlify.com → "Deploy manually"
# Or use Netlify CLI: npm install -g netlify-cli && netlify deploy
```

Add environment variables in Netlify site settings → Build & Deploy → Environment.

---

## Custom Domain (Optional)

### On Vercel:
1. Project Settings → Domains
2. Add your domain (e.g. `crewtide.io`)
3. Update your domain's DNS to point to Vercel

### Update Supabase:
- Change Site URL to your custom domain
- Add custom domain to Redirect URLs

---

## Production Checklist

Before sharing with your team:

- [ ] App is accessible at the deployed URL
- [ ] Registration works
- [ ] Login works
- [ ] Creating a project works
- [ ] Invite code + join flow works
- [ ] Tasks can be created and claimed
- [ ] Resources can be added
- [ ] Supabase Site URL updated to production URL
- [ ] Email confirmation settings configured appropriately
- [ ] `.env` file is NOT in git (check `.gitignore`)

---

## Build Locally

To test the production build locally:
```bash
npm run build    # Creates optimized build in /dist
npm run preview  # Serves the /dist folder locally
# Open: http://localhost:4173
```
