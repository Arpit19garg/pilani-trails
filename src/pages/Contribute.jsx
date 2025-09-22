import React, { useEffect, useState } from 'react'
import placesSeed from '../data/places.json'

export default function Contribute(){
  const key = 'pilani_trails_places_v1'
  const [places, setPlaces] = useState(()=> JSON.parse(localStorage.getItem(key) || '[]'))
  useEffect(()=> localStorage.setItem(key, JSON.stringify(places)), [places])

  const [form, setForm] = useState({ name:'', category:'Food', desc:'', img:'', lat:'', lng:'' })

  function submit(e){
    e.preventDefault()
    const id = 'u' + Date.now()
    const place = { id, ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng), votes: 0, source: 'user' }
    setPlaces(prev=> [place, ...prev])
    alert('Nice! Your spot is added locally. It shows on the map for you. Share to get others to upvote!')
    setForm({ name:'', category:'Food', desc:'', img:'', lat:'', lng:'' })
  }

  function autofillFromMap(){
    alert('Tip: To capture coords, open the map and click a location to create a quick pin — then edit its coordinates here.')
  }

  return (
    <div className="contribute-page">
      <h2>Contribute a spot — be the plug 🤙</h2>
      <p className="muted">Add details, drop an image link, and tell folks why this place slaps.</p>

      <form className="contrib-form" onSubmit={submit}>
        <label>Name
          <input value={form.name} onChange={e=> setForm({...form, name: e.target.value})} required />
        </label>
        <label>Category
          <select value={form.category} onChange={e=> setForm({...form, category: e.target.value})}>
            <option>Food</option><option>Cafe</option><option>Stationery</option><option>Services</option><option>Outdoors</option><option>Entertainment</option><option>Spiritual</option>
          </select>
        </label>
        <label>Description
          <textarea value={form.desc} onChange={e=> setForm({...form, desc: e.target.value})} placeholder="Why should peeps visit?" />
        </label>
        <label>Image URL (optional)
          <input value={form.img} onChange={e=> setForm({...form, img: e.target.value})} />
        </label>
        <div className="coords">
          <label>Latitude<input value={form.lat} onChange={e=> setForm({...form, lat: e.target.value})} /></label>
          <label>Longitude<input value={form.lng} onChange={e=> setForm({...form, lng: e.target.value})} /></label>
          <button type="button" className="btn ghost" onClick={autofillFromMap}>How to get coords?</button>
        </div>
        <div className="form-row">
          <button className="btn" type="submit">Submit Pin</button>
          <button type="button" className="btn ghost" onClick={()=> { setPlaces(placesSeed); localStorage.setItem(key, JSON.stringify(placesSeed)); alert('Reset to seeded spots!') }}>Reset to seeded</button>
        </div>
      </form>

      <div className="contrib-list">
        <h3>Your local pins</h3>
        {places.map(p => (
          <div key={p.id} className="place-card">
            <strong>{p.name}</strong> <span className="muted">({p.category})</span>
            <div className="desc">{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
