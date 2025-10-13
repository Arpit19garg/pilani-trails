import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import App from './App'
import 'leaflet/dist/leaflet.css'
import './styles.css'

// Get root element with fallback
const rootElement = document.getElementById('root')

if (!rootElement) {
  // If root element doesn't exist, create one
  const newRoot = document.createElement('div')
  newRoot.id = 'root'
  document.body.appendChild(newRoot)
  console.error('Root element was missing - created new one')
}

// Add global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

try {
  const root = createRoot(rootElement || document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </React.StrictMode>
  )
} catch (error) {
  console.error('Error rendering app:', error)
  // Fallback: display error message
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Error loading app: ${error.message}</div>`
}
