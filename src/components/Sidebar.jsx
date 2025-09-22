import React from 'react'
export default function Sidebar({places, categories, onFilter, onSelect}){
  return (
    <aside className="sidebar">
      <div className="side-top">
        <h2>Pilani Trails</h2>
        <p className="muted">Explore the town — filter, search & bookmark your faves.</p>
        <div className="search-row">
          <input placeholder="Search spots, e.g., 'printing' or 'momo'" onChange={(e)=> onFilter(prev=> ({...prev, q: e.target.value}))} />
        </div>
        <div className="chips">
          {categories.map(cat => (
            <button key={cat} className="chip" onClick={()=> onFilter(prev => ({...prev, category: cat}))}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="side-list">
        {places.length===0 ? <div className="empty">No matches — try fresh filters</div> :
        places.map(p => (
          <div key={p.id} className="place-card" onClick={()=> onSelect(p)}>
            <div className="place-header">
              <strong>{p.name}</strong>
              <span className="cat">{p.category}</span>
            </div>
            <div className="desc">{p.desc}</div>
            <div className="meta">
              <span>🔥 {p.votes ?? 0}</span>
              <span>{p.source === 'seed' ? 'OG' : 'User'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="side-bottom">
        <a className="btn" href="/contribute">Drop a pin</a>
      </div>
    </aside>
  )
}
