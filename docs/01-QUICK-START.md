# ⚡ CrewTide – Quick Start (5 Minutes)

## What You Need
- Node.js installed (v18+) — download from nodejs.org
- A Supabase account — free at supabase.com
- A terminal (Command Prompt, Terminal, VS Code terminal)

---

## Step 1: Install Dependencies

Open a terminal inside the `crewtide` folder and run:

```bash
npm install
```

This installs all the packages. Takes about 1-2 minutes.

---

## Step 2: Set Up Supabase

1. Go to **supabase.com** → Sign up (free)
2. Click **"New Project"** → give it a name like `crewtide`
3. Wait ~2 minutes for it to set up
4. Go to **Settings → API** in your project sidebar
5. Copy:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon public** key (long JWT string starting with `eyJ...`)

---

## Step 3: Create Your .env File

In the `crewtide` folder, create a file called `.env` (copy from `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and paste your values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-long-key-here
```

---

## Step 4: Set Up the Database

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase/migration.sql` from the CrewTide folder
4. Copy ALL its contents and paste into Supabase SQL Editor
5. Click **"Run"** (green button)
6. You should see "Success" — all tables are now created!

---

## Step 5: Run the App

```bash
npm run dev
```

Open your browser at: **http://localhost:5173**

🎉 CrewTide is running!

---

## First Steps in the App

1. Click **"Create Account"** on the landing page
2. Register with your email and name
3. Click **"+ New Project"** to create your first project
4. Copy the invite code from the **Members** tab
5. Share it with your team!

---

## Problems? See `docs/02-SETUP-GUIDE.md` for detailed help.
