import React, { useEffect, useRef, useState } from 'react'
import { CARTOON_STYLE } from '../lib/mapStyle'

export default function MapView({ places, onMarkerClick, allPlaces, allPlacesSetter }){
  const mapRef = useRef()
  const markersRef = useRef([])
  const [mapObj, setMapObj] = useState(null)

  useEffect(()=> {
    if(!window.google){
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.id = 'gmaps-api'
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap(){
      const center = { lat: 28.3581, lng: 75.6010 }
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        styles: CARTOON_STYLE,
        streetViewControl: false,
        mapTypeControl: false
      })
      setMapObj(map)
      map.addListener('click', (e)=> {
        // quick add popup - create a skeleton place
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        const name = prompt('Add spot name (short):')
        if(name){
          const id = 'u' + Date.now()
          const item = { id, name, category: 'Food', desc: 'User-submitted spot', lat, lng, votes: 0, source: 'user' }
          const copy = [...allPlaces, item]
          allPlacesSetter(copy)
          alert('Yo! Your pin is added locally. Go to Contribute page to add details & pics.')
        }
      })
    }

    return ()=> {
      // cleanup if needed
    }
  }, [])

  useEffect(()=> {
    if(!mapObj || !window.google) return
    // clear old markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    // add new markers
    places.forEach(p => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapObj,
        title: p.name,
        label: { text: (p.name||'').slice(0,1), color: '#fff' }
      })
      marker.addListener('click', ()=> {
        onMarkerClick && onMarkerClick(p)
        mapObj.panTo(marker.getPosition())
        mapObj.setZoom(17)
      })
      markersRef.current.push(marker)
    })
  }, [places, mapObj])

  return <div className="map-container">
    <div ref={mapRef} className="map-canvas" />
    <div className="map-hint">Click anywhere to add a quick pin (you can edit later on Contribute page)</div>
  </div>
}
