import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Contribute from './pages/Contribute'
import About from './pages/About'
import Admin from './pages/Admin'

export default function App(){
  return (
    <div className="app-root">
      <header className="site-header">
        <div className="brand">
          <img src="/public/logo.svg" alt="logo" className="logo" />
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
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div>Made with ☕ by Pilani peeps — be chill, be kind. • <small>v0.1 (MVP)</small></div>
      </footer>
    </div>
  )
}
