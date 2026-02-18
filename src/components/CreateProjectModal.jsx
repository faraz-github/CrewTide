// ============================================
// CrewTide - Create Project Modal
// ============================================
// Shown when user clicks "+ New Project" on Dashboard.
// Creates the project and adds the creator as 'owner' in project_members.
// Also generates a unique 8-character invite code automatically.
// ============================================

import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Generates a random 8-character alphanumeric code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const CreateProjectModal = ({ userId, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!form.name.trim()) return setError('Please enter a project name.')
    setLoading(true)
    setError('')

    // Step 1: Insert project
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        owner_id: userId,
        invite_code: generateInviteCode(),
      })
      .select()
      .single()

    if (projErr) {
      setError('Failed to create project. Please try again.')
      setLoading(false)
      return
    }

    // Step 2: Add creator as 'owner' in project_members
    const { error: memberErr } = await supabase
      .from('project_members')
      .insert({ project_id: project.id, user_id: userId, role: 'owner' })

    if (memberErr) {
      setError('Project created but membership setup failed.')
      setLoading(false)
      return
    }

    onCreated(project.name)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display font-bold text-2xl text-white mb-1">New Project</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Create a project and invite your crew.
        </p>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Project Name *
            </label>
            <input
              className="ct-input"
              placeholder="e.g. Q4 Marketing Campaign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={60}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className="ct-input resize-none"
              placeholder="What is this project about?"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={200}
            />
          </div>

          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(76,163,221,0.1)', border: '1px solid rgba(76,163,221,0.2)' }}
          >
            <span>💡</span>
            <p style={{ color: 'var(--text-secondary)' }}>
              An invite code is automatically generated. Share it with your team so they can join!
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleCreate} className="btn-coral flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project 🚀'}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal
