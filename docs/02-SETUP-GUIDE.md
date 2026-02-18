# 🛠️ CrewTide – Full Setup Guide

## Prerequisites

| Tool | Version | How to check |
|------|---------|--------------|
| Node.js | v18 or higher | `node --version` |
| npm | v9 or higher | `npm --version` |
| Browser | Chrome/Firefox/Edge | — |

---

## Part 1: Supabase Account Setup

### 1.1 Create Account
- Go to [supabase.com](https://supabase.com)
- Click **"Start your project"**
- Sign up with GitHub or email

### 1.2 Create New Project
- Click **"New Project"** from the dashboard
- Fill in:
  - **Name:** `crewtide` (or anything you like)
  - **Database Password:** Create a strong password (save it!)
  - **Region:** Pick the one closest to your users
- Click **"Create new project"**
- Wait 2-3 minutes for setup to complete

### 1.3 Get Your API Keys
- In your project, go to **Settings** (gear icon in sidebar)
- Click **API**
- You'll see two important values:

  **Project URL:**
  ```
  https://abcdefghijklmno.supabase.co
  ```
  
  **Project API Keys → anon public:**
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
  ```

> ✅ The `anon` key is safe to use in browser code. It's the public key.
> ❌ Never use the `service_role` key in your frontend — it bypasses all security!

---

## Part 2: Project Setup

### 2.1 Navigate to Project Folder
```bash
cd crewtide
```

### 2.2 Install Dependencies
```bash
npm install
```
This installs: React, Vite, Supabase client, Tailwind CSS, React Router.

### 2.3 Create Environment File
```bash
# Copy the template
cp .env.example .env
```

Open `.env` in your text editor and fill it in:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important notes:**
- The file must be named exactly `.env` (starts with a dot)
- No spaces around the `=` sign
- No quotes around the values
- This file is in `.gitignore` and will NOT be committed to git

---

## Part 3: Database Setup

### 3.1 Open Supabase SQL Editor
- In your Supabase project, click **SQL Editor** in the left sidebar
- Click **"New Query"**

### 3.2 Run the Migration
- Open `crewtide/supabase/migration.sql` in your code editor
- Select ALL the text (Ctrl+A / Cmd+A)
- Copy it (Ctrl+C / Cmd+C)
- Paste it into the Supabase SQL Editor
- Click the **"Run"** button (or press Ctrl+Enter)

### 3.3 Verify Tables Were Created
- In Supabase sidebar, click **Table Editor**
- You should see these tables:
  - ✅ `profiles`
  - ✅ `projects`
  - ✅ `project_members`
  - ✅ `tasks`
  - ✅ `project_resources`

If any are missing, try running the migration again.

---

## Part 4: Running the App

### 4.1 Start Development Server
```bash
npm run dev
```

You'll see output like:
```
  VITE v5.x.x  ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### 4.2 Open in Browser
Go to **http://localhost:5173**

---

## Part 5: First Time Usage

### 5.1 Create Your Account
1. Click **"Start for free"** on the landing page
2. Click the **"Register"** tab
3. Enter your name, pick an avatar color, email, and password
4. Click **"Create Account"**
5. You'll be redirected to your dashboard

### 5.2 Create Your First Project
1. Click **"+ New Project"**
2. Enter a project name (e.g. "Product Launch Tracker")
3. Add an optional description
4. Click **"Create Project 🚀"**

### 5.3 Get the Invite Code
1. Click on your project to open it
2. Go to the **👥 Members** tab
3. Copy the invite code (e.g. `ABCD1234`)
4. Share with team members

### 5.4 Team Member Joins
1. Team member registers at the same URL
2. On their dashboard, they click **"🔑 Join Project"**
3. They enter the invite code
4. They're now in the project!

---

## Troubleshooting

### "Missing Supabase environment variables!"
- Make sure `.env` file exists (not `.env.example`)
- Check the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after changing `.env`: stop it (Ctrl+C) then `npm run dev`

### "Invalid invite code"
- Codes are case-sensitive and 8 characters
- Make sure the code was copied correctly
- The project owner can find the code in Members tab

### Login fails with "Invalid credentials"
- Double-check email and password
- Supabase email confirmation might be required — check the Email Templates settings in Supabase Auth

### Supabase RLS errors (403/permission denied)
- Make sure you ran the full migration SQL
- Check that RLS policies were created in Table Editor → [table] → Policies

---

## Disabling Email Confirmation (Development)

For local testing, you may want to disable email confirmation:
1. In Supabase, go to **Authentication → Settings**
2. Under **Email Auth**, disable **"Enable email confirmations"**
3. Users can now register and log in immediately

---

## Next Steps
- See `docs/07-DEPLOYMENT.md` to put CrewTide online
- See `docs/USER-MANUAL.md` to share with your team
