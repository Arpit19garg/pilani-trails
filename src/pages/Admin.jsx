import React, { useEffect, useState } from 'react'
export default function Admin(){
  const key = 'pilani_trails_places_v1'
  const [pass, setPass] = useState('')
  const [authed, setAuthed] = useState(false)
  const [places, setPlaces] = useState([])

  useEffect(()=> {
    const raw = localStorage.getItem(key) || '[]'
    setPlaces(JSON.parse(raw))
  }, [])

  function login(e){
    e.preventDefault()
    const ok = pass === import.meta.env.VITE_ADMIN_PASS
    setAuthed(ok)
    if(!ok) alert('Nah fam, wrong pass.')
  }

  function remove(id){
    if(!confirm('Delete for real?')) return
    const next = places.filter(p => p.id !== id)
    setPlaces(next)
    localStorage.setItem(key, JSON.stringify(next))
  }

  if(!authed) {
    return (
      <div className="admin-page">
        <h2>Admin</h2>
        <p>Enter the admin pass (set in <code>.env.local</code>)</p>
        <form onSubmit={login}>
          <input value={pass} onChange={e=> setPass(e.target.value)} placeholder="admin pass" />
          <button className="btn" type="submit">Unlock</button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <p className="muted">Manage local pins</p>
      <div className="admin-list">
        {places.map(p => (
          <div key={p.id} className="place-card">
            <strong>{p.name}</strong> <small>{p.category}</small>
            <div className="desc">{p.desc}</div>
            <div className="meta">
              <span>Votes: {p.votes ?? 0}</span>
              <button className="btn ghost" onClick={()=> remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
