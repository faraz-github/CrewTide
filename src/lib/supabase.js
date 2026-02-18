// ============================================
// CrewTide - Supabase Client
// ============================================
// This file initializes the connection to your Supabase project.
// Supabase handles: Authentication, Database, and APIs automatically.
//
// The values come from your .env file (which you must create from .env.example)
// NEVER commit your real .env file to git.
// ============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Missing Supabase environment variables!\n' +
    'Please copy .env.example to .env and fill in your values.\n' +
    'See docs/02-SETUP-GUIDE.md for step-by-step instructions.'
  )
}

// Create and export the Supabase client
// This single instance is reused across the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
