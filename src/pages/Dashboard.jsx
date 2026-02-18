import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import CreateProjectModal from '../components/CreateProjectModal'

// ── Project Card ───────────────────────────
const ProjectCard = ({ project, onClick }) => {
  const taskCount   = project.task_count   || 0
  const memberCount = project.member_count || 0
  const doneCount   = project.done_count   || 0
  const progress    = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0
  const isLive      = project.session_ends_at && new Date(project.session_ends_at) > new Date()

  return (
    <div
      className={`glass-card p-6 cursor-pointer hover:scale-[1.01] transition-transform ${isLive ? 'session-active-card' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-lg text-white truncate">{project.name}</h3>
            {project.userRole === 'owner' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#FDBA74' }}>
                Owner
              </span>
            )}
          </div>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
            {project.description || 'No description'}
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full self-start"
            style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.4)' }}>
            <span className="session-dot" />
            <span className="text-xs font-bold" style={{ color: '#2DD4BF' }}>LIVE</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        <span>👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        <span>📋 {taskCount} task{taskCount !== 1 ? 's' : ''}</span>
      </div>

      {taskCount > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <span>Progress</span>
            <span style={{ color: 'var(--teal-400)' }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--tide-500), var(--teal-500))' }} />
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--tide-400)' }}>Open →</span>
      </div>
    </div>
  )
}

// ── Join Modal ─────────────────────────────
const JoinModal = ({ userId, onClose, onJoined }) => {
  const [code, setCode]   = useState('')
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!code.trim()) return setError('Enter an invite code.')
    setBusy(true)
    setError('')

    const { data: project } = await supabase
      .from('projects')
      .select('id, name')
      .eq('invite_code', code.trim().toUpperCase())
      .single()

    if (!project) {
      setError('Invalid invite code.')
      setBusy(false)
      return
    }

    const { data: already } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', userId)
      .single()

    if (already) {
      setError("You're already in this project!")
      setBusy(false)
      return
    }

    const { error: joinErr } = await supabase
      .from('project_members')
      .insert({ project_id: project.id, user_id: userId, role: 'member' })

    if (joinErr) {
      setError('Failed to join. Try again.')
    } else {
      onJoined(project.name)
    }
    setBusy(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Join a Project</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enter the invite code your project owner shared with you.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        <input
          className="ct-input mb-4 uppercase tracking-widest text-center font-display font-bold text-xl"
          placeholder="XXXXXXXX"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          maxLength={8}
        />

        <div className="flex gap-3">
          <button onClick={handleJoin} className="btn-primary flex-1" disabled={busy}>
            {busy ? 'Joining...' : 'Join Project 🌊'}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────
const Dashboard = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin]     = useState(false)
  const [msg, setMsg] = useState('')

  // Loads project list. Doesn't touch loading state when called for refresh.
  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('project_members')
      .select('role, project:projects(id, name, description, created_at, invite_code, session_ends_at)')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const rows = await Promise.all(
      (data || []).map(async ({ role, project }) => {
        if (!project) return null
        const [m, t, d] = await Promise.all([
          supabase.from('project_members').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id).eq('status', 'done'),
        ])
        return { ...project, userRole: role, member_count: m.count || 0, task_count: t.count || 0, done_count: d.count || 0 }
      })
    )

    setProjects(rows.filter(Boolean))
    setLoading(false)
  }

  // Run once on mount. user is guaranteed by ProtectedRoute.
  useEffect(() => { loadProjects() }, [])

  const showMsg = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 4000)
  }

  const handleCreated = (name) => {
    setShowCreate(false)
    showMsg(`Project "${name}" created! 🎉`)
    loadProjects()
  }

  const handleJoined = (name) => {
    setShowJoin(false)
    showMsg(`You joined "${name}"! 🌊`)
    loadProjects()
  }

  return (
    <div className="min-h-screen ocean-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">
              Hey, {profile?.name?.split(' ')[0] || 'Crew Member'}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {loading ? 'Loading...'
                : projects.length === 0 ? "You're not in any projects yet."
                : `You're in ${projects.length} project${projects.length !== 1 ? 's' : ''}.`}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <button onClick={() => setShowJoin(true)} className="btn-secondary text-sm flex-1 sm:flex-none">🔑 Join</button>
            <button onClick={() => setShowCreate(true)} className="btn-coral text-sm flex-1 sm:flex-none">+ New Project</button>
          </div>
        </div>

        {/* Success message */}
        {msg && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold animate-slide-up"
            style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', color: '#5EEAD4' }}>
            ✅ {msg}
          </div>
        )}

        {/* States */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="ct-loader mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>Fetching your projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌊</div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">The ocean awaits!</h3>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Create your first project or join one with an invite code.
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setShowCreate(true)} className="btn-coral">+ Create Project</button>
              <button onClick={() => setShowJoin(true)} className="btn-secondary">🔑 Join with Code</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/project/${project.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateProjectModal
          userId={user.id}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {showJoin && (
        <JoinModal
          userId={user.id}
          onClose={() => setShowJoin(false)}
          onJoined={handleJoined}
        />
      )}
    </div>
  )
}

export default Dashboard
