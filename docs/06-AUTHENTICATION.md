# 🔐 CrewTide – Authentication Documentation

## How Auth Works

CrewTide uses **Supabase Auth** (built on top of GoTrue) for all authentication.

### Flow Overview:
```
User fills in Register form
  ↓
supabase.auth.signUp() → creates entry in auth.users
  ↓
We insert a row in our `profiles` table with user's name + avatar color
  ↓
AuthContext detects the session change
  ↓
Fetches the profile from `profiles` table
  ↓
User is redirected to /dashboard
```

---

## Session Management

Supabase automatically:
- Stores the session in `localStorage`
- Refreshes the access token before it expires
- Restores the session on page reload

In `AuthContext.jsx`, we listen for session changes:
```js
supabase.auth.onAuthStateChange((event, session) => {
  // This fires on: login, logout, token refresh, password change
  if (session?.user) {
    setUser(session.user)
    fetchProfile(session.user.id)
  } else {
    setUser(null)
    setProfile(null)
  }
})
```

---

## Two Separate User Records

Supabase auth creates two separate records for each user:

1. **`auth.users`** (Supabase-managed, you can't directly access this table)
   - Stores: email, password hash, last sign in, etc.
   - You access it via `supabase.auth.getUser()`

2. **`profiles`** (Our custom table in the public schema)
   - Stores: name, avatar_color
   - You query it like any other table

These are linked by the same UUID (`id`).

---

## Protected Routes

Routes are protected in `App.jsx` using wrapper components:

### ProtectedRoute:
```jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/auth" replace />
}
```

Used for: `/dashboard`, `/project/:id`

### PublicRoute:
```jsx
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return !user ? children : <Navigate to="/dashboard" replace />
}
```

Used for: `/` and `/auth` — logged in users skip these.

---

## useAuth Hook

Import and use in any component:
```jsx
import { useAuth } from '../contexts/AuthContext'

const { user, profile, loading, signOut, refreshProfile } = useAuth()
```

| Property | Type | Description |
|----------|------|-------------|
| `user` | Object/null | Supabase auth user (has `.id`, `.email`) |
| `profile` | Object/null | Our profiles row (has `.name`, `.avatar_color`) |
| `loading` | Boolean | True while session is being checked |
| `signOut` | Function | Logs user out and clears state |
| `refreshProfile` | Function | Re-fetches profile from DB |

---

## Common Auth Patterns

### Check if logged in:
```jsx
const { user } = useAuth()
if (!user) return <div>Please log in</div>
```

### Get current user ID (for DB queries):
```jsx
const { user } = useAuth()
const userId = user?.id  // Always use ?. to avoid errors
```

### Get display name:
```jsx
const { profile } = useAuth()
const name = profile?.name || 'Anonymous'
```

---

## Supabase Auth Settings

In your Supabase project → **Authentication → Settings**:

### For Development (Recommended):
- **Email confirmations:** OFF
  - Users can sign up and log in immediately
  - No need to check email

### For Production:
- **Email confirmations:** ON
  - More secure but requires setting up SMTP email
  - Users must verify email before logging in

### Site URL:
- Development: `http://localhost:5173`
- Production: your deployed URL (e.g. `https://crewtide.vercel.app`)

---

## Security Notes

✅ **The `anon` key is safe in the browser** — it only has access to what your RLS policies allow.

❌ **Never use the `service_role` key in the frontend** — it bypasses ALL security policies.

✅ **Passwords are hashed by Supabase** — they never touch your own code in plaintext.

✅ **Sessions expire automatically** — Supabase handles token refresh transparently.

---

## Logging Out

Logout happens in `Navbar.jsx`:
```js
const handleSignOut = async () => {
  await signOut()         // Clears Supabase session
  navigate('/')           // Redirect to landing page
}
```

The `signOut` function from `AuthContext`:
```js
const signOut = async () => {
  await supabase.auth.signOut()  // Clears localStorage session
  setUser(null)
  setProfile(null)
}
```
