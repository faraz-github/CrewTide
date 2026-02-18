import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import TaskBoard from '../components/TaskBoard'
import MemberList from '../components/MemberList'
import ResourcesHub from '../components/ResourcesHub'
import ProjectSettings from '../components/ProjectSettings'

const ProjectView = () => {
  const { projectId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject]   = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const loadProject = async () => {
    const [projectRes, memberRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('project_members').select('role').eq('project_id', projectId).eq('user_id', user.id).single(),
    ])

    if (projectRes.error || !projectRes.data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (memberRes.error || !memberRes.data) {
      navigate('/dashboard')
      return
    }

    setProject(projectRes.data)
    setUserRole(memberRes.data.role)
    setLoading(false)
  }

  // Run once on mount. user is guaranteed by ProtectedRoute.
  useEffect(() => { loadProject() }, [])

  const tabs = [
    { id: 'tasks',     label: '📋 Tasks' },
    { id: 'members',   label: '👥 Members' },
    { id: 'resources', label: '🔗 Resources' },
    ...(userRole === 'owner' ? [{ id: 'settings', label: '⚙️ Settings' }] : []),
  ]

  if (loading) {
    return (
      <div className="min-h-screen ocean-bg">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="ct-loader mx-auto mb-4" />
            <p style={{ color: 'var(--text-muted)' }}>Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen ocean-bg">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-center">
          <div>
            <div className="text-6xl mb-4">🌊</div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">Project not found</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              This project doesn't exist or you don't have access.
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ocean-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="text-sm mb-3 flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}>
            ← All Projects
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">{project.name}</h1>
              {project.description && (
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
              )}
            </div>
            <div className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={userRole === 'owner'
                ? { background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#FDBA74' }
                : { background: 'rgba(76,163,221,0.15)', border: '1px solid rgba(76,163,221,0.3)', color: 'var(--tide-400)' }}>
              {userRole === 'owner' ? '👑 Owner' : '🌊 Member'}
            </div>
          </div>
          <div className="wave-line mt-6 opacity-30" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-6 border-b pb-2 overflow-x-auto" style={{ borderColor: 'var(--border)', scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button key={tab.id}
              className={`ct-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'tasks' &&
            <TaskBoard projectId={projectId} userId={user.id} userRole={userRole} />}
          {activeTab === 'members' &&
            <MemberList projectId={projectId} userId={user.id} userRole={userRole} inviteCode={project.invite_code} />}
          {activeTab === 'resources' &&
            <ResourcesHub projectId={projectId} userId={user.id} userRole={userRole} />}
          {activeTab === 'settings' && userRole === 'owner' &&
            <ProjectSettings project={project} userId={user.id} onProjectUpdated={loadProject} onProjectDeleted={() => navigate('/dashboard')} />}
        </div>
      </main>
    </div>
  )
}

export default ProjectView
