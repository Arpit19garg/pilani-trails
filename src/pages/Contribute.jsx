import React, { useEffect, useState } from 'react'
import placesSeed from '../data/places.json'

export default function Contribute() {
  const key = 'pilani_trails_places_v1'
  const [places, setPlaces] = useState(() => JSON.parse(localStorage.getItem(key) || '[]'))
  useEffect(() => localStorage.setItem(key, JSON.stringify(places)), [places])

  const [form, setForm] = useState({
    name: '',
    category: 'Food',
    desc: '',
    img: '',
    lat: '',
    lng: ''
  })

  function submit(e) {
    e.preventDefault()
    const id = 'u' + Date.now()
    const place = {
      id,
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      votes: 0,
      source: 'user'
    }
    setPlaces(prev => [place, ...prev])
    alert('Nice! Your spot is added locally. It shows on the map for you. Share to get others to upvote!')
    setForm({
      name: '',
      category: 'Food',
      desc: '',
      img: '',
      lat: '',
      lng: ''
    })
  }

  function autofillFromMap() {
    alert('Tip: To capture coords, open the map and click a location to create a quick pin — then edit its coordinates here.')
  }

  return (
    <div className="contribute-page">
      <h2>Contribute a spot — be the plug 🤙</h2>
      <p className="muted">
        Add details, drop an image link, and tell folks why this place slaps.
      </p>
      <form className="contrib-form" onSubmit={submit}>
        <label>
          Name
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Category
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Food</option>
            <option>Cafe</option>
            <option>Stationery</option>
            <option>Services</option>
            <option>Outdoors</option>
            <option>Entertainment</option>
            <option>Spiritual</option>
          </select>
        </label>
        <label>
          Description
          <input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
        </label>
        <label>
          Image URL
          <input value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} placeholder="https://..." />
        </label>
        <label>
          Latitude
          <input value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} required />
        </label>
        <label>
          Longitude
          <input value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} required />
        </label>
        <button type="button" onClick={autofillFromMap}>How to pick coords?</button>
        <button type="submit">Add Spot</button>
      </form>
    </div>
  )
}
