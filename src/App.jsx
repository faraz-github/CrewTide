// ============================================
// CrewTide - App Router
// ============================================
// Sets up all routes and protects pages that require login.
// Public routes: /, /auth
// Protected routes: /dashboard, /project/:id
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ProjectView from './pages/ProjectView'

// ProtectedRoute: Redirects to /auth if user is not logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen ocean-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌊</div>
          <div className="ct-loader mx-auto" />
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/auth" replace />
}

// PublicRoute: Redirects to /dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen ocean-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌊</div>
          <div className="ct-loader mx-auto" />
        </div>
      </div>
    )
  }

  return !user ? children : <Navigate to="/dashboard" replace />
}

const AppRoutes = () => (
  <Routes>
    {/* Public: Landing page */}
    <Route path="/" element={
      <PublicRoute><Landing /></PublicRoute>
    } />

    {/* Public: Login / Register */}
    <Route path="/auth" element={
      <PublicRoute><Auth /></PublicRoute>
    } />

    {/* Protected: User dashboard */}
    <Route path="/dashboard" element={
      <ProtectedRoute><Dashboard /></ProtectedRoute>
    } />

    {/* Protected: Individual project view */}
    <Route path="/project/:projectId" element={
      <ProtectedRoute><ProjectView /></ProtectedRoute>
    } />

    {/* Catch-all redirect */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
)

export default App
