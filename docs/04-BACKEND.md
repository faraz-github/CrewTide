# 🔧 CrewTide – Backend & Supabase Documentation

## Overview

CrewTide uses **Supabase** as its complete backend. Supabase provides:

| Feature | What it does in CrewTide |
|---------|--------------------------|
| **Auth** | User registration, login, sessions |
| **Database** | PostgreSQL — stores all app data |
| **Auto REST API** | Generated from your tables automatically |
| **Row Level Security** | Ensures users only see authorized data |

There is **no custom backend server**. Everything goes through the Supabase client library directly from the React frontend.

---

## Supabase Client

File: `src/lib/supabase.js`

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

This client is imported and used in every component that needs data.

---

## Common Query Patterns

### SELECT (fetch data):
```js
// Fetch all tasks for a project
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: true })
```

### SELECT with JOIN (fetch related data):
```js
// Fetch members with their profile info
const { data } = await supabase
  .from('project_members')
  .select(`
    role,
    profile:profiles (id, name, avatar_color)
  `)
  .eq('project_id', projectId)
```

### INSERT:
```js
// Create a new task
const { data, error } = await supabase
  .from('tasks')
  .insert({ project_id: projectId, title: 'New task', ... })
  .select()  // Returns the inserted row
  .single()  // Returns a single object instead of array
```

### UPDATE:
```js
// Claim a task
const { error } = await supabase
  .from('tasks')
  .update({ assigned_to: userId, status: 'in_progress' })
  .eq('id', taskId)
```

### DELETE:
```js
// Remove a project resource
const { error } = await supabase
  .from('project_resources')
  .delete()
  .eq('id', resourceId)
```

### COUNT (without fetching rows):
```js
// Count tasks without getting all task data
const { count } = await supabase
  .from('tasks')
  .select('id', { count: 'exact', head: true })
  .eq('project_id', projectId)
```

---

## Authentication

### Sign Up:
```js
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})
// data.user.id is the new user's UUID
```

### Sign In:
```js
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### Sign Out:
```js
await supabase.auth.signOut()
```

### Get Current Session:
```js
const { data: { session } } = await supabase.auth.getSession()
// session.user is the logged-in user
```

### Listen for Auth Changes:
```js
// Used in AuthContext.jsx
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    // event: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc.
    // session: current session or null
  }
)
// Always cleanup:
return () => subscription.unsubscribe()
```

---

## Row Level Security (RLS)

RLS policies are rules in the database that automatically filter data.

**Example:** The `tasks` table has this policy:
```sql
-- Users can only SEE tasks in projects they're a member of
CREATE POLICY "tasks_select_members"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  );
```

This means even if you somehow call the API with a different project ID, Supabase will return no results. The security is enforced at the database level, not just in the frontend.

### How to Add a New Policy:
In Supabase → Table Editor → Your Table → Policies → Add Policy

Or write SQL:
```sql
CREATE POLICY "my_policy_name"
  ON my_table FOR SELECT  -- or INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id);  -- the condition
```

---

## Error Handling

Always check for errors after Supabase calls:
```js
const { data, error } = await supabase.from('tasks').select('*')

if (error) {
  console.error('Supabase error:', error.message)
  // Show error to user
  return
}

// Use data safely
```

Common error codes:
- `PGRST116` - Row not found (`.single()` returned nothing)
- `23505` - Unique constraint violation (duplicate entry)
- `42501` - RLS policy violation (permission denied)

---

## Supabase Dashboard Tips

### View Your Data:
- **Table Editor** → Browse and edit rows directly

### Debug Queries:
- **SQL Editor** → Write raw SQL to debug
  ```sql
  SELECT * FROM tasks WHERE project_id = 'your-project-uuid';
  ```

### View Auth Users:
- **Authentication → Users** → See all registered accounts

### Monitor API Calls:
- **API → Logs** → See every query the app makes

---

## Environment Variables Reference

| Variable | Where to find it | Used for |
|----------|-----------------|----------|
| `VITE_SUPABASE_URL` | Settings → API → Project URL | Connects to your DB |
| `VITE_SUPABASE_ANON_KEY` | Settings → API → anon public | Auth + API access |
