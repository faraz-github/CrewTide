import { useState } from 'react'
import { supabase } from '../lib/supabase'

const DURATIONS = [
  { label: '15 min',  minutes: 15 },
  { label: '30 min',  minutes: 30 },
  { label: '1 hour',  minutes: 60 },
  { label: '2 hours', minutes: 120 },
]

const ProjectSettings = ({ project, userId, onProjectUpdated, onProjectDeleted }) => {
  const [form, setForm] = useState({ name: project.name, description: project.description || '' })
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError]       = useState('')

  // Live session state
  const isActive = project.session_ends_at && new Date(project.session_ends_at) > new Date()
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [sessionBusy, setSessionBusy] = useState(false)

  // Format remaining time e.g. "42 min left"
  const getTimeLeft = () => {
    if (!isActive) return ''
    const diff = Math.round((new Date(project.session_ends_at) - new Date()) / 60000)
    if (diff <= 0) return ''
    return diff < 60 ? `${diff} min left` : `${Math.ceil(diff / 60)}h left`
  }

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Project name cannot be empty.')
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const { error: err } = await supabase
      .from('projects')
      .update({ name: form.name.trim(), description: form.description.trim() || null })
      .eq('id', project.id)

    if (err) { setError('Failed to save changes.') }
    else { setSuccessMsg('Project updated!'); onProjectUpdated(); setTimeout(() => setSuccessMsg(''), 3000) }
    setSaving(false)
  }

  const handleStartSession = async () => {
    setSessionBusy(true)
    const endsAt = new Date(Date.now() + selectedDuration * 60000).toISOString()
    await supabase.from('projects').update({ session_ends_at: endsAt }).eq('id', project.id)
    onProjectUpdated()
    setSessionBusy(false)
  }

  const handleEndSession = async () => {
    setSessionBusy(true)
    await supabase.from('projects').update({ session_ends_at: null }).eq('id', project.id)
    onProjectUpdated()
    setSessionBusy(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return
    setDeleting(true)
    const { error: err } = await supabase.from('projects').delete().eq('id', project.id)
    if (err) { setError('Failed to delete project.'); setDeleting(false) }
    else { onProjectDeleted() }
  }

  return (
    <div className="max-w-xl space-y-6">

      {/* Project Details */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-xl text-white mb-1">Project Details</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Update the project name and description.</p>

        {successMsg && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', color: '#5EEAD4' }}>
            ✅ {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Project Name</label>
            <input className="ct-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={60} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea className="ct-input resize-none" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?" maxLength={200} />
          </div>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Live Session */}
      <div className="rounded-xl p-6" style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(45,109,181,0.1))'
          : 'rgba(255,255,255,0.03)',
        border: isActive ? '1px solid rgba(20,184,166,0.4)' : '1px solid var(--border)',
        transition: 'all 0.4s ease',
      }}>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-xl text-white">🟢 Live Session</h3>
          {isActive && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(20,184,166,0.2)', border: '1px solid rgba(20,184,166,0.4)', color: '#2DD4BF' }}>
              ACTIVE · {getTimeLeft()}
            </span>
          )}
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {isActive
            ? 'Your team can see that you are available right now. End the session when done.'
            : 'Start a session to signal your team that you are available for a discussion or sync.'}
        </p>

        {isActive ? (
          <button onClick={handleEndSession} disabled={sessionBusy} className="btn-danger px-5 py-2.5 text-sm">
            {sessionBusy ? 'Ending...' : '⏹ End Session'}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                How long will you be available?
              </label>
              <div className="flex gap-2 flex-wrap">
                {DURATIONS.map(d => (
                  <button key={d.minutes} onClick={() => setSelectedDuration(d.minutes)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={selectedDuration === d.minutes ? {
                      background: 'linear-gradient(135deg, var(--tide-500), var(--teal-500))',
                      color: 'white',
                    } : {
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleStartSession} disabled={sessionBusy} className="btn-primary">
              {sessionBusy ? 'Starting...' : '▶ Start Session'}
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl p-6"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h3 className="font-display font-bold text-lg mb-1" style={{ color: '#FCA5A5' }}>⚠️ Danger Zone</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Deleting this project is permanent. All tasks, resources, and members will be removed.
        </p>
        <button onClick={handleDelete} disabled={deleting}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5' }}>
          {deleting ? 'Deleting...' : '🗑️ Delete Project'}
        </button>
      </div>
    </div>
  )
}

export default ProjectSettings
