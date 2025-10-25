import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function LocationPickerMap({ value, onChange }) {
  const [marker, setMarker] = useState(value || null);

  const handleSelect = (latlng) => {
    setMarker(latlng);
    onChange && onChange(latlng);
  };

  return (
    <div style={{ height: "300px", width: "100%", marginBottom: "1rem" }}>
      <MapContainer
        center={marker ? [marker.lat, marker.lng] : [28.36, 75.59]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <ClickHandler onSelect={handleSelect} />
        {marker && <Marker position={[marker.lat, marker.lng]} />}
      </MapContainer>
      <p style={{ marginTop: "6px", fontSize: "0.9rem", color: "#333" }}>
        {marker
          ? `Selected: ${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`
          : "Click on the map to drop a pin for this location"}
      </p>
    </div>
  );
}
