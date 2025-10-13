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
    // stub: in real, get map pin from context
    alert('If you just clicked a pin on the map, we'd auto-fill lat/lng here.')
  }

  return (
    <div className="contribute-page">
      <h2>Contribute a Place</h2>
      <p>Help newbies find hidden gems.</p>
      <p className="muted">
        If you want official data or admin features, check out the Admin page.
      </p>
      <form className="contrib-form" onSubmit={submit}>
        <label>
          Name*
          <input
            required
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. 24x7 Print Shop"
          />
        </label>
        <label>
          Category
          <select
            value={form.category}
            onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
          >
            <option>Food</option>
            <option>Coffee/Tea</option>
            <option>Groceries</option>
            <option>Study</option>
            <option>Hospital</option>
            <option>Fun</option>
            <option>Utilities</option>
          </select>
        </label>
        <label>
          Description
          <textarea
            value={form.desc}
            onChange={e => setForm(prev => ({ ...prev, desc: e.target.value }))}
            placeholder="What makes it special?"
          />
        </label>
        <label>
          Image URL (optional)
          <input
            value={form.img}
            onChange={e => setForm(prev => ({ ...prev, img: e.target.value }))}
            placeholder="https://..."
          />
        </label>
        <label>
          Latitude*
          <input
            required
            type="number"
            step="any"
            value={form.lat}
            onChange={e => setForm(prev => ({ ...prev, lat: e.target.value }))}
          />
        </label>
        <label>
          Longitude*
          <input
            required
            type="number"
            step="any"
            value={form.lng}
            onChange={e => setForm(prev => ({ ...prev, lng: e.target.value }))}
          />
        </label>
        <button className="btn ghost" type="button" onClick={autofillFromMap}>
          Autofill coords from map click
        </button>
        <button className="btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  )
}
