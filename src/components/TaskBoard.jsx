// ============================================
// CrewTide - Task Board Component
// ============================================
// Shows all tasks in a project organized by status columns.
// Owners: Can create and delete tasks
// Members: Can claim unclaimed tasks and update status of their own tasks
// ============================================

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Avatar helper ──────────────────────────
const MiniAvatar = ({ profile }) => {
  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: profile?.avatar_color || '#2D6DB5' }}
      title={profile?.name}
    >
      {initials}
    </div>
  )
}

// ── Add Task Modal ─────────────────────────
const AddTaskModal = ({ projectId, userId, onClose, onTaskAdded }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!form.title.trim()) return setError('Task title is required.')
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('tasks').insert({
      project_id: projectId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      deadline: form.deadline || null,
      status: 'todo',
      created_by: userId,
    })

    if (err) {
      setError('Failed to create task.')
    } else {
      onTaskAdded()
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display font-bold text-xl text-white mb-4">Add New Task</h2>

        {error && (
          <div
            className="mb-4 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Task *</label>
            <input
              className="ct-input"
              placeholder="e.g. Review and finalize project proposal"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className="ct-input resize-none"
              placeholder="Any extra context..."
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select
                className="ct-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Deadline</label>
              <input
                type="date"
                className="ct-input"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleAdd} className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Adding...' : 'Add Task'}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Task Card ──────────────────────────────
const TaskCard = ({ task, userId, userRole, members, onUpdate, onDelete }) => {
  const isOwned = task.assigned_to === userId
  const isProjectOwner = userRole === 'owner'
  const assignee = members.find(m => m.user_id === task.assigned_to)?.profile

  const canClaim = !task.assigned_to
  const canUpdateStatus = isOwned || isProjectOwner
  const canDelete = isProjectOwner

  const handleClaim = async () => {
    await supabase.from('tasks').update({ assigned_to: userId, status: 'in_progress' }).eq('id', task.id)
    onUpdate()
  }

  const handleStatusChange = async (e) => {
    await supabase.from('tasks').update({ status: e.target.value }).eq('id', task.id)
    onUpdate()
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    await supabase.from('tasks').delete().eq('id', task.id)
    onUpdate()
  }

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

  return (
    <div
      className="glass-card p-4 animate-fade-in"
      style={isOwned ? { borderColor: 'rgba(76,163,221,0.4)' } : {}}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-white text-sm leading-tight flex-1">{task.title}</h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`badge-${task.priority}`}>{task.priority}</span>
          {canDelete && (
            <button onClick={handleDelete} className="text-xs opacity-40 hover:opacity-100 transition-opacity ml-1" style={{ color: '#FCA5A5' }}>✕</button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
      )}

      {/* Deadline */}
      {task.deadline && (
        <div className="flex items-center gap-1 text-xs mb-2" style={{ color: isOverdue ? '#FCA5A5' : 'var(--text-muted)' }}>
          📅 {new Date(task.deadline).toLocaleDateString()} {isOverdue && '⚠️ Overdue'}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Assignee */}
        {assignee ? (
          <div className="flex items-center gap-1.5">
            <MiniAvatar profile={assignee} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{assignee.name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
        )}

        {/* Actions */}
        {canClaim && (
          <button onClick={handleClaim} className="text-xs px-3 py-1 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(76,163,221,0.2)', border: '1px solid rgba(76,163,221,0.3)', color: 'var(--tide-400)' }}>
            Claim ✋
          </button>
        )}
        {canUpdateStatus && task.assigned_to && (
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done ✓</option>
          </select>
        )}
        {!canClaim && !canUpdateStatus && (
          <span className={`status-${task.status.replace('_', '-')}`}>
            {task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Column ─────────────────────────────────
const Column = ({ title, icon, tasks, userId, userRole, members, onUpdate, onDelete, accentColor }) => (
  <div className="flex-1 min-w-0 w-full">
    <div className="flex items-center gap-2 mb-4">
      <span>{icon}</span>
      <h3 className="font-display font-bold text-sm text-white">{title}</h3>
      <span
        className="text-xs px-2 py-0.5 rounded-full ml-auto"
        style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}
      >
        {tasks.length}
      </span>
    </div>
    <div
      className="rounded-xl p-3 min-h-[200px] space-y-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
    >
      {tasks.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          No tasks here
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            userId={userId}
            userRole={userRole}
            members={members}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  </div>
)

// ── TaskBoard ──────────────────────────────
const TaskBoard = ({ projectId, userId, userRole }) => {
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'mine'

  const fetchData = async () => {
    const [tasksRes, membersRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
      supabase.from('project_members').select('user_id, role, profile:profiles(id, name, avatar_color)').eq('project_id', projectId),
    ])

    setTasks(tasksRes.data || [])
    setMembers(membersRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleUpdate = () => fetchData()
  const handleDelete = () => fetchData()

  const displayed = filter === 'mine' ? tasks.filter(t => t.assigned_to === userId) : tasks

  const columns = [
    { status: 'todo', title: 'To Do', icon: '📝' },
    { status: 'in_progress', title: 'In Progress', icon: '⚙️' },
    { status: 'done', title: 'Done', icon: '✅' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="ct-loader" />
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {['all', 'mine'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`ct-tab ${filter === f ? 'active' : ''}`}
            >
              {f === 'all' ? '📋 All Tasks' : '👤 My Tasks'}
            </button>
          ))}
        </div>

        {userRole === 'owner' && (
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
            + Add Task
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>Total: <strong className="text-white">{tasks.length}</strong></span>
        <span>Done: <strong style={{ color: '#5EEAD4' }}>{tasks.filter(t => t.status === 'done').length}</strong></span>
        <span>Unclaimed: <strong style={{ color: '#FDBA74' }}>{tasks.filter(t => !t.assigned_to).length}</strong></span>
      </div>

      {/* Kanban columns */}
      <div className="flex flex-col md:flex-row gap-4">
        {columns.map((col) => (
          <Column
            key={col.status}
            title={col.title}
            icon={col.icon}
            tasks={displayed.filter(t => t.status === col.status)}
            userId={userId}
            userRole={userRole}
            members={members}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Add task modal */}
      {showAdd && (
        <AddTaskModal
          projectId={projectId}
          userId={userId}
          onClose={() => setShowAdd(false)}
          onTaskAdded={() => { setShowAdd(false); fetchData() }}
        />
      )}
    </div>
  )
}

export default TaskBoard
