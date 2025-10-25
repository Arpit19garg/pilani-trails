// src/components/MapView.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "./Home.css"; // for popup styles (we'll add next)

// fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapView() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // live listen to approved locations
    const unsub = onSnapshot(collection(db, "approvedLocations"), (snap) => {
      const arr = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (x) =>
            x.location &&
            typeof x.location.lat === "number" &&
            typeof x.location.lng === "number"
        );
      setLocations(arr);
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ height: "calc(100vh - 70px)", width: "100%" }}>
      <MapContainer
        center={[28.36, 75.59]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.location.lat, loc.location.lng]}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <div className="popup-tooltip">
                <strong>{loc.name}</strong>
                <div>{loc.category || "—"}</div>
              </div>
            </Tooltip>
            <Popup className="popup-card">
              <div className="popup-card-inner">
                <h4>{loc.name}</h4>
                <p>{loc.description}</p>
                {loc.imageUrl && (
                  <img
                    src={loc.imageUrl}
                    alt={loc.name}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
                <p style={{ marginTop: 8 }}>
                  <small>{loc.category}</small>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
