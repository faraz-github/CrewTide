import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Gets a friendly city name from IANA timezone string
// e.g. "Asia/Karachi" → "Karachi", "America/New_York" → "New York"
const getCity = (tz) => {
  if (!tz || tz === 'UTC') return 'UTC'
  const city = tz.split('/').pop()
  return city.replace(/_/g, ' ')
}

// Gets current local time string for a given timezone
const getLocalTime = (tz) => {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: tz || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return '—'
  }
}

// Live clock component — updates every minute
const LiveClock = ({ timezone }) => {
  const [time, setTime] = useState(() => getLocalTime(timezone))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getLocalTime(timezone))
    }, 60000)
    return () => clearInterval(interval)
  }, [timezone])

  return <span>{time}</span>
}

const MemberList = ({ projectId, userId, userRole, inviteCode }) => {
  const [members, setMembers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState(false)
  const [addEmail, setAddEmail]   = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError]   = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('project_members')
      .select('*, profile:profiles(id, name, email, avatar_color, timezone)')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true })

    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [projectId])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddByEmail = async () => {
    if (!addEmail.trim()) return setAddError('Enter an email address.')
    setAddLoading(true)
    setAddError('')
    setAddSuccess('')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('email', addEmail.trim().toLowerCase())
      .single()

    if (error || !profile) {
      setAddError('No user found with that email. Make sure they have a CrewTide account.')
      setAddLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', profile.id)
      .single()

    if (existing) {
      setAddError(`${profile.name} is already in this project.`)
      setAddLoading(false)
      return
    }

    const { error: joinErr } = await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: profile.id, role: 'member' })

    if (joinErr) {
      setAddError('Failed to add member. Please try again.')
    } else {
      setAddSuccess(`${profile.name} has been added! 🎉`)
      setAddEmail('')
      fetchMembers()
    }

    setAddLoading(false)
  }

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this project?`)) return
    await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', memberId)
    fetchMembers()
  }

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="ct-loader" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Invite Code */}
      <div className="rounded-xl p-5" style={{
        background: 'linear-gradient(135deg, rgba(45,109,181,0.2), rgba(20,184,166,0.1))',
        border: '1px solid rgba(76,163,221,0.3)',
      }}>
        <h3 className="font-display font-bold text-white mb-1">🔑 Invite Code</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Share this code with anyone you want to invite.
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-center py-3 rounded-xl font-display font-bold text-2xl tracking-widest"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(76,163,221,0.3)', color: 'var(--tide-400)', letterSpacing: '0.2em' }}>
            {inviteCode}
          </code>
          <button onClick={handleCopyCode} className="btn-primary px-5 py-3 text-sm flex-shrink-0">
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Add by email (owner only) */}
      {userRole === 'owner' && (
        <div className="glass-card p-5">
          <h3 className="font-display font-bold text-white mb-1">Add Member by Email</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            If they already have a CrewTide account, you can add them directly.
          </p>

          {addError && (
            <div className="mb-3 px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
              {addError}
            </div>
          )}
          {addSuccess && (
            <div className="mb-3 px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', color: '#5EEAD4' }}>
              {addSuccess}
            </div>
          )}

          <div className="flex gap-3">
            <input
              className="ct-input flex-1"
              type="email"
              placeholder="member@email.com"
              value={addEmail}
              onChange={(e) => { setAddEmail(e.target.value); setAddError(''); setAddSuccess('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddByEmail()}
            />
            <button onClick={handleAddByEmail} className="btn-primary px-5 text-sm flex-shrink-0" disabled={addLoading}>
              {addLoading ? '...' : '+ Add'}
            </button>
          </div>
        </div>
      )}

      {/* Member List */}
      <div className="glass-card p-5">
        <h3 className="font-display font-bold text-white mb-4">
          Team ({members.length} member{members.length !== 1 ? 's' : ''})
        </h3>

        <div className="space-y-3">
          {members.map((member) => {
            const profile = member.profile
            const isMe    = member.user_id === userId
            const isOwner = member.role === 'owner'
            const tz      = profile?.timezone

            return (
              <div key={member.user_id}
                className="flex items-center gap-3 py-3 px-3 rounded-xl transition-all flex-wrap sm:flex-nowrap"
                style={isMe
                  ? { background: 'rgba(76,163,221,0.08)', border: '1px solid rgba(76,163,221,0.2)' }
                  : { background: 'rgba(255,255,255,0.03)' }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0"
                  style={{ background: profile?.avatar_color || '#2D6DB5' }}
                >
                  {getInitials(profile?.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{profile?.name}</span>
                    {isMe && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(you)</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {tz && (
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        🌍 {getCity(tz)}
                      </span>
                    )}
                    {tz && (
                      <span className="text-xs font-medium" style={{ color: 'var(--tide-400)' }}>
                        🕐 <LiveClock timezone={tz} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Role + remove */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={isOwner
                      ? { background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#FDBA74' }
                      : { background: 'rgba(76,163,221,0.15)', border: '1px solid rgba(76,163,221,0.3)', color: 'var(--tide-400)' }}
                  >
                    {isOwner ? '👑 Owner' : '🌊 Member'}
                  </span>

                  {userRole === 'owner' && !isOwner && !isMe && (
                    <button onClick={() => handleRemove(member.user_id, profile?.name)} className="btn-danger">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MemberList
