import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import Sidebar from '../components/Sidebar';
import placesSeed from '../data/places.json';

function usePlaces() {
  const key = 'pilani_trails_places_v1';
  const [places, setPlaces] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure parsed is an array; otherwise fallback to seed
        if (Array.isArray(parsed) && parsed.length >= 0) return parsed;
      }
      // if nothing valid in storage, initialize with seed
      localStorage.setItem(key, JSON.stringify(placesSeed));
      return placesSeed;
    } catch (e) {
      // On parse error, return empty array (safe fallback)
      console.warn('usePlaces: failed to read places from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(places));
    } catch (e) {
      console.warn('usePlaces: failed to save places to localStorage', e);
    }
  }, [places]);

  return [places, setPlaces];
}

export default function Home() {
  const [places, setPlaces] = usePlaces();
  const [filter, setFilter] = useState({ q: '', category: 'All' });
  const [selected, setSelected] = useState(null);

  const filtered = places.filter((p) => {
    const q = filter.q.toLowerCase();
    const matchesQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q);
    const matchesCat = filter.category === 'All' || p.category === filter.category;
    return matchesQ && matchesCat;
  });

  return (
    <div className="home-grid">
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        places={places}
        setPlaces={setPlaces}
        selected={selected}
        setSelected={setSelected}
      />
      <MapView
        places={filtered}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
