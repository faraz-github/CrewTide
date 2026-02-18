# 🎨 CrewTide – Frontend Documentation

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool & dev server |
| React Router | 6 | Client-side routing |
| Tailwind CSS | 3 | Utility-first styling |
| Supabase JS | 2 | Database & auth client |

---

## Project Structure

```
src/
├── pages/                  # Full page components (one per route)
│   ├── Landing.jsx         # / — Marketing landing page
│   ├── Auth.jsx            # /auth — Login + Register
│   ├── Dashboard.jsx       # /dashboard — User's project list
│   └── ProjectView.jsx     # /project/:id — Project workspace
│
├── components/             # Reusable UI components
│   ├── Navbar.jsx          # Top navigation bar
│   ├── CreateProjectModal.jsx  # Modal to create a new project
│   ├── TaskBoard.jsx       # Kanban-style task board
│   ├── MemberList.jsx      # Team member management
│   ├── ResourcesHub.jsx    # Links/resources manager
│   └── ProjectSettings.jsx # Owner-only project settings
│
├── contexts/
│   └── AuthContext.jsx     # Global auth state (useAuth hook)
│
├── lib/
│   └── supabase.js         # Supabase client initialization
│
├── App.jsx                 # Root: router + route protection
├── main.jsx                # Entry point
└── index.css               # Global styles + CSS variables
```

---

## Routing

Routing is handled by **React Router v6** in `App.jsx`.

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Landing | Public (redirects to /dashboard if logged in) |
| `/auth` | Auth | Public (redirects to /dashboard if logged in) |
| `/dashboard` | Dashboard | Protected (redirects to /auth if not logged in) |
| `/project/:projectId` | ProjectView | Protected + must be project member |

### Route Protection Pattern:
```jsx
// ProtectedRoute: redirects to /auth if no user
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/auth" />
}
```

---

## Auth Context

The `AuthContext` provides global user state via the `useAuth()` hook.

### Usage in any component:
```jsx
import { useAuth } from '../contexts/AuthContext'

const MyComponent = () => {
  const { user, profile, loading, signOut } = useAuth()
  
  // user    - Supabase auth user object (has .id, .email)
  // profile - Our profiles table row (has .name, .avatar_color)
  // loading - true while checking session
  // signOut - function to log out
}
```

---

## Styling System

### CSS Variables (in index.css):
```css
--navy-950: #060E1E      /* darkest background */
--navy-900: #0D1F3C      /* main background */
--tide-400: #4CA3DD      /* primary blue */
--teal-500: #14B8A6      /* accent teal */
--coral-500: #F97316     /* CTA orange */
--text-primary: #F0F7FF  /* main text */
--text-secondary: #8EB8D9 /* secondary text */
--text-muted: #4A7BA4    /* muted text */
--border: rgba(76,163,221,0.2)  /* card borders */
--glass: rgba(255,255,255,0.05) /* glassmorphism bg */
```

### Reusable CSS Classes (in index.css):
```
.glass-card     - Glassmorphism card with border + hover
.ocean-bg       - Radial gradient ocean background
.btn-primary    - Tide-blue gradient button
.btn-secondary  - Glass/bordered secondary button
.btn-coral      - Orange gradient CTA button
.btn-danger     - Red-tinted danger action button
.ct-input       - Dark-themed input field
.modal-overlay  - Fixed overlay backdrop for modals
.modal-box      - Modal dialog container
.ct-tab         - Tab navigation button
.badge-high/medium/low  - Priority badges
.status-todo/in-progress/done - Status badges
.ct-loader      - Spinning loading indicator
```

---

## Component Details

### TaskBoard.jsx
The Kanban board with three columns (To Do | In Progress | Done).

**Key behaviors:**
- `userRole === 'owner'` → can add and delete tasks
- Unclaimed tasks (`assigned_to === null`) → anyone can "Claim"
- Claiming a task: sets `assigned_to = userId` and status to `in_progress`
- Only assigned user (or owner) can change the status via dropdown
- Overdue detection: compares `task.deadline` to today

### MemberList.jsx
Shows all project members with their roles and actions.

**Key behaviors:**
- Shows invite code prominently with copy button
- Owner can add members by email (must already have a CrewTide account)
- Owner can remove any non-owner member
- Cannot remove yourself or the owner

### ResourcesHub.jsx
The links hub for sharing external resources.

**Key behaviors:**
- Auto-detects platform from URL (Figma, Google Drive, GitHub, etc.)
- Shows appropriate emoji icon per platform
- Category filter buttons (All / Scope / Design / Code / Docs / Other)
- Anyone can add links; owner or creator can delete

---

## State Management

CrewTide uses **React's built-in state** only:
- `useState` for local component state
- `useEffect` for data fetching on mount
- Context API (`AuthContext`) for global auth state

No Redux or Zustand needed — the app is simple enough.

---

## Key Patterns Used

### Data Fetching Pattern:
```jsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchData()
}, [projectId])  // Re-fetch when projectId changes

const fetchData = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
  
  setData(data || [])
  setLoading(false)
}
```

### Update + Refresh Pattern:
```jsx
// After any mutation, call fetchData() to reload fresh data
const handleClaim = async () => {
  await supabase.from('tasks').update({ assigned_to: userId }).eq('id', task.id)
  onUpdate()  // This calls fetchData() in the parent
}
```

### Permission Check Pattern:
```jsx
// Check role before showing admin controls
{userRole === 'owner' && (
  <button>Delete Task</button>
)}
```

---

## Adding New Features

To add a new tab to ProjectView:
1. Create `src/components/MyNewTab.jsx`
2. Add to the tabs array in `ProjectView.jsx`:
   ```jsx
   { id: 'mytab', label: '🆕 New Tab' }
   ```
3. Add the conditional render:
   ```jsx
   {activeTab === 'mytab' && <MyNewTab projectId={projectId} />}
   ```
