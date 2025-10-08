import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Header from './components/Header'
import Home from './pages/Home'
import Contribute from './pages/Contribute'
import About from './pages/About'
import Admin from './pages/Admin'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import ProposeLocation from './components/ProposeLocation'
import AdminReview from './components/AdminReview'

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
            <pre style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
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

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="app-root">
        <Header />
        <main className="main">
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contribute" element={<Contribute />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/propose-location"
                  element={
                    <ProtectedRoute>
                      <ProposeLocation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-review"
                  element={
                    <ProtectedRoute>
                      <AdminReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </React.Suspense>
          </ErrorBoundary>
        </main>
        <footer className="site-footer">
          <p>Made with ☕ by Pilani peeps — be chill, be kind. • v0.1 (MVP)</p>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
