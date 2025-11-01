// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import MapView from "../components/MapView";
import Sidebar from "../components/Sidebar";
import bg from "../assets/bg.jpg";
import "./Home.css";

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState({ q: "", category: "All" });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "approvedLocations"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLocations(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Filters
  const filtered = locations.filter((loc) => {
    const q = filter.q.toLowerCase();
    const matchesQ =
      !q ||
      (loc.name && loc.name.toLowerCase().includes(q)) ||
      (loc.description && loc.description.toLowerCase().includes(q));
    const matchesCat =
      filter.category === "All" ||
      (loc.category && loc.category === filter.category);
    return matchesQ && matchesCat;
  });

  // Category list
  const categories = [
    "All",
    ...Array.from(
      new Set((Array.isArray(locations) ? locations : []).map((loc) => loc.category || "Other"))
    ),
  ];

  if (loading)
    return (
      <div className="loading-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Loading trails...
        </motion.div>
      </div>
    );

  return (
    <div
      className="home-grid"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        className="sidebar-container"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
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
      </motion.div>

      <motion.div
        className="map-container"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <MapView
          places={filtered}
          selected={selected}
          setSelected={setSelected}
          allPlaces={locations}
          allPlacesSetter={setLocations}
        />
      </motion.div>
    </div>
  );
}
