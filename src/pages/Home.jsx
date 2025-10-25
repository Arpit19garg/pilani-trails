import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import MapView from "../components/MapView";
import Sidebar from "../components/Sidebar";
import "./Home.css";

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState({ q: "", category: "All" });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Real-time listener to Firestore (approved locations only)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "approvedLocations"), (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setLocations(docs);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🧭 Filter locations by query & category
  const filtered = locations.filter((loc) => {
    const q = filter.q.toLowerCase();
    const matchesQ =
      !q ||
      loc.name?.toLowerCase().includes(q) ||
      loc.description?.toLowerCase().includes(q);
    const matchesCat =
      filter.category === "All" ||
      (loc.category && loc.category === filter.category);
    return matchesQ && matchesCat;
  });

  // 🏷️ Unique categories list
  const categories = [
    "All",
    ...Array.from(
      new Set(
        (Array.isArray(locations) ? locations : []).map(
          (loc) => loc.category || "Other"
        )
      )
    ),
  ];

  if (loading) return <div className="loading-screen">Loading map...</div>;

  return (
    <div className="home-grid">
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        places={locations}
        setPlaces={setLocations}
        selected={selected}
        setSelected={setSelected}
        categories={categories}
        onFilter={setFilter}
        onSelect={setSelected}
      />

      <MapView
        places={filtered}
        selected={selected}
        setSelected={setSelected}
        allPlaces={locations}
        allPlacesSetter={setLocations}
      />
    </div>
  );
}
