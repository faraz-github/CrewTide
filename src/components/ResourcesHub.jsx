// ============================================
// CrewTide - Resources Hub Component
// ============================================
// Instead of complex file uploads, this lets team members
// share links to Google Drive, Figma, Notion, GitHub, etc.
// All members can add links. Owners can delete any link.
// Members can delete their own links.
// ============================================

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['All', 'Scope', 'Design', 'Code', 'Docs', 'Other']

// Detect platform from URL for nice icon display
const getLinkIcon = (url) => {
  if (!url) return '🔗'
  const u = url.toLowerCase()
  if (u.includes('figma.com')) return '🎨'
  if (u.includes('drive.google.com') || u.includes('docs.google.com') || u.includes('sheets.google')) return '📁'
  if (u.includes('github.com')) return '💻'
  if (u.includes('notion.so')) return '📝'
  if (u.includes('miro.com')) return '🖼️'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return '📺'
  if (u.includes('loom.com')) return '🎬'
  if (u.includes('vercel.app') || u.includes('netlify.app')) return '🚀'
  return '🔗'
}

const getCategoryColor = (cat) => {
  const map = {
    Scope: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', color: '#C4B5FD' },
    Design: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', color: '#FDBA74' },
    Code: { bg: 'rgba(76,163,221,0.15)', border: 'rgba(76,163,221,0.3)', color: 'var(--tide-400)' },
    Docs: { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.3)', color: '#5EEAD4' },
    Other: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', color: 'var(--text-secondary)' },
  }
  return map[cat] || map.Other
}

// ── Add Link Modal ─────────────────────────
const AddLinkModal = ({ projectId, userId, onClose, onAdded }) => {
  const [form, setForm] = useState({ title: '', url: '', description: '', category: 'Other' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.url.trim()) return setError('URL is required.')

    // Basic URL validation
    let url = form.url.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('project_resources').insert({
      project_id: projectId,
      title: form.title.trim(),
      url,
      description: form.description.trim() || null,
      category: form.category,
      added_by: userId,
    })

    if (err) {
      setError('Failed to add resource. Please try again.')
    } else {
      onAdded()
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display font-bold text-xl text-white mb-4">Add Resource Link</h2>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Title *</label>
            <input
              className="ct-input"
              placeholder="e.g. Homepage Wireframe"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>URL *</label>
            <input
              className="ct-input"
              placeholder="https://figma.com/... or docs.google.com/..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              className="ct-input"
              placeholder="What is this? Latest version, reference file..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.filter(c => c !== 'All').map((cat) => {
                const style = getCategoryColor(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={form.category === cat ? {
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      color: style.color,
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleAdd} className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Adding...' : 'Add Resource 🔗'}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Resource Card ──────────────────────────
const ResourceCard = ({ resource, userId, userRole, members, onDelete }) => {
  const catStyle = getCategoryColor(resource.category)
  const adder = members.find(m => m.user_id === resource.added_by)?.profile
  const canDelete = userRole === 'owner' || resource.added_by === userId

  return (
    <div className="glass-card p-4 flex items-start gap-4">
      <div className="text-3xl flex-shrink-0">{getLinkIcon(resource.url)}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white hover:underline block truncate"
            >
              {resource.title} ↗
            </a>
            {resource.description && (
              <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{resource.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: catStyle.bg, border: `1px solid ${catStyle.border}`, color: catStyle.color }}
            >
              {resource.category}
            </span>
            {canDelete && (
              <button
                onClick={() => onDelete(resource.id)}
                className="text-xs opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: '#FCA5A5' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          {adder && <span>Added by {adder.name.split(' ')[0]}</span>}
          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

// ── ResourcesHub ───────────────────────────
const ResourcesHub = ({ projectId, userId, userRole }) => {
  const [resources, setResources] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const fetchData = async () => {
    const [resRes, memRes] = await Promise.all([
      supabase.from('project_resources').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('project_members').select('user_id, profile:profiles(id, name, avatar_color)').eq('project_id', projectId),
    ])
    setResources(resRes.data || [])
    setMembers(memRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Remove this resource?')) return
    await supabase.from('project_resources').delete().eq('id', resourceId)
    fetchData()
  }

  const displayed = activeCategory === 'All'
    ? resources
    : resources.filter(r => r.category === activeCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="ct-loader" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-white">🔗 Resources Hub</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Share links to docs, designs, repos, and anything useful.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
          + Add Link
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`ct-tab ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat}
            <span className="ml-1.5 text-xs opacity-60">
              {cat === 'All' ? resources.length : resources.filter(r => r.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Resources */}
      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔗</div>
          <h4 className="font-display font-bold text-white mb-2">No resources yet</h4>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Add links to Google Drive, Figma, GitHub, Notion — anything your team needs!
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            + Add First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              userId={userId}
              userRole={userRole}
              members={members}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddLinkModal
          projectId={projectId}
          userId={userId}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); fetchData() }}
        />
      )}
    </div>
  )
}

export default ResourcesHub
