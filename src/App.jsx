import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './components/AuthContext'
import Home from './pages/Home'
import Contribute from './pages/Contribute'
import About from './pages/About'
import Admin from './pages/Admin'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import ProposeLocation from './components/ProposeLocation'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff3cd', minHeight: '100vh' }}>
          <h1>⚠️ Oops! Something went wrong</h1>
          <p>The app encountered an error. Please try refreshing the page.</p>
          <details style={{ marginTop: '1rem', textAlign: 'left', maxWidth: '600px', margin: '1rem auto' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
            <pre style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}>
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Fallback component for lazy loading errors
function LoadingFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Loading...</p>
    </div>
  )
}

// Header component with authentication
function AppHeader() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="site-header">
      <div className="brand">
        <img src="/logo.svg" alt="logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
        <div>
          <h1>Pilani‑Trails</h1>
          <div className="tag">Drop a pin, flex your findz ✨</div>
        </div>
      </div>
      <nav className="nav">
        <Link to="/">Map</Link>
        <Link to="/contribute">Contribute</Link>
        <Link to="/about">About</Link>
        <Link to="/admin">Admin</Link>
        {currentUser ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} style={{ 
              background: 'none', 
              border: '1px solid currentColor', 
              color: 'inherit', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: 'inherit'
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  )
}

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="app-root">
        <AppHeader />
        <main className="main">
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contribute" element={<Contribute />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/propose" element={
                  <ProtectedRoute>
                    <ProposeLocation />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
              </Routes>
            </React.Suspense>
          </ErrorBoundary>
        </main>
        <footer className="site-footer">
          <div>Made with ☕ by Pilani peeps — be chill, be kind. • <small>v0.1 (MVP)</small></div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
