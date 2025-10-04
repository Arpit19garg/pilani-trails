import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
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
        <App />
      </HashRouter>
    </React.StrictMode>
  )
} catch (error) {
  console.error('Failed to render app:', error)
  // Display fallback UI
  const fallbackDiv = document.createElement('div')
  fallbackDiv.style.cssText = 'padding: 2rem; text-align: center; font-family: system-ui, sans-serif;'
  fallbackDiv.innerHTML = `
    <h1>⚠️ Failed to load Pilani-Trails</h1>
    <p>The application encountered an error during startup.</p>
    <p style="color: #666; font-size: 0.9em;">Error: ${error.message}</p>
    <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; margin-top: 1rem;">Reload Page</button>
  `
  document.body.appendChild(fallbackDiv)
}
