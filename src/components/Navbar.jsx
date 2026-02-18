import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: 'rgba(13, 31, 60, 0.85)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🌊</span>
          <span className="font-display font-bold text-lg text-white">CrewTide</span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Refresh button — full page reload, always up to date */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Refresh page"
          >
            <span>⟳</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold text-white"
                style={{ background: profile?.avatar_color || '#2D6DB5' }}
              >
                {initials}
              </div>
              <span className="text-sm font-semibold hidden sm:inline" style={{ color: 'var(--text-primary)' }}>
                {profile?.name?.split(' ')[0] || 'You'}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>▾</span>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl z-50 py-1 animate-slide-up"
                  style={{ background: 'var(--navy-800)', border: '1px solid var(--border)' }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold text-white">{profile?.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{profile?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/dashboard'); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    🏠 Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
                    style={{ color: '#FCA5A5' }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
