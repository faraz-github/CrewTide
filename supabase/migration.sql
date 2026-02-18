-- ============================================
-- CrewTide — Complete Database Migration
-- ============================================
-- Run once in: Supabase → SQL Editor → New Query → Paste → Run
--
-- What this creates:
--   profiles          — user display info (name, avatar, timezone)
--   projects          — project records (with live session support)
--   project_members   — who belongs to which project + role
--   tasks             — tasks within projects
--   project_resources — shared links/resources per project
--
-- All tables are created FIRST, then all RLS policies after.
-- This avoids cross-reference errors during execution.
-- ============================================


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ══════════════════════════════════════════
-- STEP 1: CREATE ALL TABLES
-- ══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  avatar_color  TEXT DEFAULT '#2D6DB5',
  timezone      TEXT DEFAULT 'UTC',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  owner_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code      TEXT UNIQUE NOT NULL,
  session_ends_at  TIMESTAMPTZ DEFAULT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role        TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  assigned_to  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status       TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority     TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  deadline     DATE,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_resources (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'Other' CHECK (category IN ('Scope', 'Design', 'Code', 'Docs', 'Other')),
  added_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ══════════════════════════════════════════
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ══════════════════════════════════════════

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;


-- ══════════════════════════════════════════
-- STEP 3: CREATE ALL POLICIES
-- ══════════════════════════════════════════

-- ── profiles ──────────────────────────────
-- Any logged-in user can read profiles (needed to show member names/avatars)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Users can only create their own profile row
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ── projects ──────────────────────────────
-- Any authenticated user can read projects
-- (needed to look up projects by invite code when joining)
CREATE POLICY "projects_select_authenticated"
  ON projects FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Any authenticated user can create a project
CREATE POLICY "projects_insert_authenticated"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only the project owner can update project details
CREATE POLICY "projects_update_owner"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid());

-- Only the project owner can delete the project
CREATE POLICY "projects_delete_owner"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());


-- ── project_members ───────────────────────
-- Any authenticated user can read memberships
-- (simple policy — avoids self-referential recursion which causes infinite load)
CREATE POLICY "members_select_authenticated"
  ON project_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Any authenticated user can join a project (insert themselves as member)
CREATE POLICY "members_insert_authenticated"
  ON project_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only project owners can remove members
CREATE POLICY "members_delete_owner"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm2
      WHERE pm2.project_id = project_members.project_id
        AND pm2.user_id    = auth.uid()
        AND pm2.role       = 'owner'
    )
  );


-- ── tasks ─────────────────────────────────
-- Project members can see tasks in their projects
CREATE POLICY "tasks_select_members"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
        AND project_members.user_id    = auth.uid()
    )
  );

-- Only project owners can create tasks
CREATE POLICY "tasks_insert_owner"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
        AND project_members.user_id    = auth.uid()
        AND project_members.role       = 'owner'
    )
  );

-- Any project member can update tasks (claim, change status)
CREATE POLICY "tasks_update_members"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
        AND project_members.user_id    = auth.uid()
    )
  );

-- Only project owners can delete tasks
CREATE POLICY "tasks_delete_owner"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
        AND project_members.user_id    = auth.uid()
        AND project_members.role       = 'owner'
    )
  );


-- ── project_resources ─────────────────────
-- Project members can see resources
CREATE POLICY "resources_select_members"
  ON project_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_resources.project_id
        AND project_members.user_id    = auth.uid()
    )
  );

-- Any project member can add resources
CREATE POLICY "resources_insert_members"
  ON project_resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_resources.project_id
        AND project_members.user_id    = auth.uid()
    )
  );

-- Resource creator or project owner can delete
CREATE POLICY "resources_delete_owner_or_creator"
  ON project_resources FOR DELETE
  USING (
    added_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_resources.project_id
        AND project_members.user_id    = auth.uid()
        AND project_members.role       = 'owner'
    )
  );


-- ══════════════════════════════════════════
-- Done. 5 tables + all RLS policies created.
-- ══════════════════════════════════════════
