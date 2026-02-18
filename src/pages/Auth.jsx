// ============================================
// CrewTide - Auth Page (Login / Register)
// ============================================
// Handles both login and registration on the same page.
// The URL param ?mode=register opens the register tab automatically.
//
// FLOW:
// 1. Register: Creates Supabase auth user → creates profile in DB
// 2. Login: Authenticates with Supabase → fetches profile
// On success: Redirects to /dashboard (handled by ProtectedRoute in App.jsx)
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AVATAR_COLORS = [
  '#2D6DB5', '#14B8A6', '#F97316', '#8B5CF6',
  '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
]

const Auth = () => {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarColor: AVATAR_COLORS[0],
  })

  useEffect(() => {
    setError('')
  }, [mode])

  // ── LOGIN ──────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Hard redirect so getSession() re-runs fresh with the new session
      window.location.href = '/dashboard'
    }
  }

  // ── REGISTER ──────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!registerForm.name.trim()) return setError('Please enter your name.')
    if (registerForm.password.length < 6) return setError('Password must be at least 6 characters.')
    if (registerForm.password !== registerForm.confirmPassword) return setError('Passwords do not match.')

    setLoading(true)

    // Step 1: Create Supabase auth account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Step 2: Create profile in our "profiles" table
    // This stores the display name and avatar color
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: registerForm.name.trim(),
          email: registerForm.email,
          avatar_color: registerForm.avatarColor,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })

      if (profileError) {
        setError('Account created but profile setup failed. Please contact support.')
        setLoading(false)
        return
      }
    }

    // Hard redirect so getSession() re-runs fresh with the new session
    window.location.href = '/dashboard'
  }

  // Get initials for avatar preview
  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?'
  }

  return (
    <div className="min-h-screen ocean-bg flex">
      {/* Left: Branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(45,109,181,0.2), rgba(20,184,166,0.1))',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-3xl">🌊</span>
            <span className="font-display font-bold text-2xl text-white">CrewTide</span>
          </div>
        </div>

        <div>
          <blockquote className="text-2xl font-display font-bold text-white mb-4 leading-tight">
            "Great things are built<br />by great crews."
          </blockquote>
          <p style={{ color: 'var(--text-secondary)' }}>
            Join student teams from around the world building real projects together.
          </p>
        </div>

        <div className="wave-line opacity-50" />
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🌊</span>
            <span className="font-display font-bold text-xl text-white">CrewTide</span>
          </div>

          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-tide-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={mode === 'login' ? {
                background: 'linear-gradient(135deg, var(--tide-500), var(--teal-500))'
              } : {}}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={mode === 'register' ? {
                background: 'linear-gradient(135deg, var(--tide-500), var(--teal-500))'
              } : {}}
            >
              Register
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="ct-input"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="ct-input"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full mt-2 py-4 text-base"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="ct-input"
                  placeholder="e.g. Alex Johnson"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                />
              </div>

              {/* Avatar preview + color picker */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Avatar Color
                </label>
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-white text-lg flex-shrink-0"
                    style={{ background: registerForm.avatarColor }}
                  >
                    {getInitials(registerForm.name)}
                  </div>
                  {/* Color swatches */}
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setRegisterForm({ ...registerForm, avatarColor: color })}
                        className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                        style={{
                          background: color,
                          outline: registerForm.avatarColor === color ? `3px solid white` : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="ct-input"
                  placeholder="your@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="ct-input"
                  placeholder="Min. 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="ct-input"
                  placeholder="Repeat password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-coral w-full mt-2 py-4 text-base"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account 🚀'}
              </button>
            </form>
          )}

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            By continuing, you agree to build awesome things with your crew. 🌊
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
