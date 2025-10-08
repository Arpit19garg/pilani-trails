import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map clicks
function MapClickHandler({ allPlaces, allPlacesSetter }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      const name = prompt('Add spot name (short):')
      if (name) {
        const id = 'u' + Date.now()
        const item = { 
          id, 
          name, 
          category: 'Food', 
          desc: 'User-submitted spot', 
          lat, 
          lng, 
          votes: 0, 
          source: 'user' 
        }
        const copy = [...allPlaces, item]
        allPlacesSetter(copy)
        alert('Yo! Your pin is added locally. Go to Contribute page to add details & pics.')
      }
    },
  })
  return null
}

export default function MapView({ places, onMarkerClick, allPlaces, allPlacesSetter }) {
  const center = [28.3581, 75.6010] // Pilani coordinates

  return (
    <div className="map-container" style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tiles - Free and no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map click handler for adding new places */}
        <MapClickHandler allPlaces={allPlaces} allPlacesSetter={allPlacesSetter} />
        
        {/* Render markers for all places */}
        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            eventHandlers={{
              click: () => {
                onMarkerClick && onMarkerClick(place)
              },
            }}
          >
            <Popup>
              <strong>{place.name}</strong><br />
              {place.category && <span>Category: {place.category}</span>}<br />
              {place.desc && <span>{place.desc}</span>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="map-hint" style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 20px',
        borderRadius: '5px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        zIndex: 1000,
        fontSize: '14px',
        textAlign: 'center'
      }}>
        Click anywhere on the map to add a quick pin (you can edit later on Contribute page)
      </div>
    </div>
  )
}
