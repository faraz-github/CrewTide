// ============================================
// CrewTide - Landing Page
// ============================================

import { useNavigate } from 'react-router-dom'

const WaveSVG = () => (
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 opacity-20">
    <path
      d="M0,60 C200,0 400,120 600,60 C800,0 1000,120 1200,60 L1200,120 L0,120 Z"
      fill="#4CA3DD"
    />
  </svg>
)

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-6 animate-slide-up">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-display font-bold text-lg mb-2 text-white">{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
  </div>
)

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen ocean-bg">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌊</div>
          <span className="font-display font-bold text-xl text-white">CrewTide</span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="btn-primary text-sm"
        >
          Get Started →
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-fade-in"
          style={{
            background: 'rgba(76, 163, 221, 0.15)',
            border: '1px solid rgba(76, 163, 221, 0.3)',
            color: 'var(--tide-400)',
          }}
        >
          🌊 Built for volunteer teams
        </div>

        {/* Headline */}
        <h1
          className="font-display font-extrabold text-5xl md:text-7xl mb-6 leading-tight animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, #F0F7FF 30%, #4CA3DD 70%, #14B8A6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Ride the tide,<br />build together.
        </h1>

        {/* Sub */}
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
          style={{ color: 'var(--text-secondary)' }}
        >
          CrewTide is a lightweight collaboration platform for student teams and
          volunteers. Create projects, assign tasks, and track progress — all in one
          beautiful space.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up">
          <button
            onClick={() => navigate('/auth?mode=register')}
            className="btn-coral text-base px-8 py-4"
          >
            Start for free 🚀
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="btn-secondary text-base px-8 py-4"
          >
            Sign in
          </button>
        </div>

        {/* Wave divider */}
        <div className="mt-20">
          <WaveSVG />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            Everything your crew needs
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            No bloat. No steep learning curve. Just collaboration that works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="📋"
            title="Claim & Own Tasks"
            desc="Team members pick up tasks they want to own. No one gets assigned work they didn't sign up for."
          />
          <FeatureCard
            icon="👥"
            title="Role-Based Access"
            desc="Project owners have full control. Members get just enough to collaborate effectively."
          />
          <FeatureCard
            icon="🔗"
            title="Resources Hub"
            desc="Share links to Google Drive, Figma, Notion and any external resource directly in your project."
          />
          <FeatureCard
            icon="🔑"
            title="Invite Links"
            desc="Share a unique invite code or link. Members join your project instantly with one click."
          />
          <FeatureCard
            icon="🌍"
            title="Timezone Aware"
            desc="Built for international, async teams. See what everyone is working on, any time of day."
          />
          <FeatureCard
            icon="⚡"
            title="Refreshingly Simple"
            desc="Hit refresh and see the latest. No complexity. Just your team, your tasks, your progress."
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(45,109,181,0.3), rgba(20,184,166,0.2))',
            border: '1px solid rgba(76, 163, 221, 0.3)',
          }}
        >
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Ready to ride? 🌊
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Create your project in under 2 minutes.
          </p>
          <button
            onClick={() => navigate('/auth?mode=register')}
            className="btn-coral text-base px-8 py-4"
          >
            Create your crew →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8 text-center text-sm"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center justify-center gap-2">
          <span>🌊</span>
          <span>CrewTide — Built for teams that build things together</span>
        </div>
      </footer>
    </div>
  )
}

export default Landing
