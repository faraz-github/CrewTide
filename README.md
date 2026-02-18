# 🌊 CrewTide

**Ride the tide, build together.**

CrewTide is a lightweight project management platform built for distributed volunteer and remote teams. Simple to use, designed for people across different time zones, with everything a crew needs to stay in sync.

---

## ✨ Features

- 🔐 **Auth** — Email/password register and login
- 📁 **Multi-project** — Create or join unlimited projects
- 👑 **Roles** — Owners have full control, members collaborate
- 🔑 **Invite system** — 8-character code, members join instantly
- 📋 **Task board** — Kanban: To Do → In Progress → Done
- ✋ **Claim tasks** — Members pick up work they want to own
- 👥 **Team view** — See everyone's role, location city, and live local time
- 🔗 **Resources hub** — Share links to Drive, Figma, GitHub, Notion, etc.
- 🟢 **Live session** — Owner signals availability with a timed active indicator
- 🌍 **Timezone aware** — Each member's city and current time shown on the team page
- ⚙️ **Project settings** — Rename, describe, or delete (owners only)
- 🔄 **Refresh** — Full page reload keeps all data current

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + custom CSS |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Fonts | Bricolage Grotesque + Nunito |
| Deploy | Vercel (recommended) |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Fill in your Supabase URL and anon key

# 3. Run the database migration
# → Paste supabase/migration.sql into Supabase SQL Editor and run

# 4. Start the dev server
npm run dev
# Open http://localhost:5173
```

See **[docs/01-QUICK-START.md](docs/01-QUICK-START.md)** for the full setup walkthrough.

---

## 📁 Project Structure

```
crewtide/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx       # Public landing page
│   │   ├── Auth.jsx          # Register + Login
│   │   ├── Dashboard.jsx     # All user projects
│   │   └── ProjectView.jsx   # Project workspace (tasks, members, resources)
│   ├── components/
│   │   ├── Navbar.jsx              # Top nav with refresh + user menu
│   │   ├── TaskBoard.jsx           # Kanban task board
│   │   ├── MemberList.jsx          # Team members with timezone clocks
│   │   ├── ResourcesHub.jsx        # Shared links hub
│   │   ├── ProjectSettings.jsx     # Project config + live session
│   │   └── CreateProjectModal.jsx  # New project dialog
│   ├── contexts/
│   │   └── AuthContext.jsx   # Global session state
│   ├── lib/
│   │   └── supabase.js       # Supabase client
│   ├── App.jsx               # Router + route protection
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles + CSS variables
├── supabase/
│   └── migration.sql         # Run once to set up entire database
├── docs/                     # Full documentation
├── public/
│   └── favicon.svg
├── .env.example              # Environment variable template
└── package.json
```

---

## 📚 Documentation

| File | Contents |
|------|----------|
| [docs/01-QUICK-START.md](docs/01-QUICK-START.md) | Up and running in 5 minutes |
| [docs/02-SETUP-GUIDE.md](docs/02-SETUP-GUIDE.md) | Detailed Supabase setup + troubleshooting |
| [docs/03-FRONTEND.md](docs/03-FRONTEND.md) | Component structure, routing, patterns |
| [docs/04-BACKEND.md](docs/04-BACKEND.md) | Supabase queries, auth, RLS |
| [docs/05-DATABASE.md](docs/05-DATABASE.md) | Schema, columns, relationships |
| [docs/06-AUTHENTICATION.md](docs/06-AUTHENTICATION.md) | Auth flow, sessions, protected routes |
| [docs/07-DEPLOYMENT.md](docs/07-DEPLOYMENT.md) | Deploy to Vercel |
| [docs/USER-MANUAL.md](docs/USER-MANUAL.md) | End-user guide for team members |

---

## 🔑 Environment Variables

```bash
cp .env.example .env
```

| Variable | Where to find it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |

---

## 🗄️ Database Setup

One file, run once:

1. Open `supabase/migration.sql`
2. Copy all contents
3. Paste into **Supabase → SQL Editor → New Query**
4. Click **Run**

Creates all 5 tables with proper relationships and Row Level Security policies.

---

## 🌐 Deployment

```bash
npm run build   # Build for production → /dist
```

Recommended: **Vercel** — connect your GitHub repo, add environment variables, deploy. See [docs/07-DEPLOYMENT.md](docs/07-DEPLOYMENT.md).

---

*🌊 CrewTide — Built for teams that build things together*
