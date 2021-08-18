import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import React, { useState, useRef, useCallback } from 'react'
import MapGL from 'react-map-gl'
import Geocoder from 'react-map-gl-geocoder'

const MAPBOX_TOKEN = 'pk.eyJ1IjoibmF2ZGVlcHlhZGF2IiwiYSI6ImNrc2EzM2pnejBqaWUyeHA0bW8xaXFwaWEifQ.hIpiYzWrUer4F31GpCqoHA'

export const MapLocationSelection = () => {
  // TODO: Get local coordinates
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  })
  const geocoderContainerRef = useRef()
  const mapRef = useRef()
  const handleViewportChange = useCallback((newViewport) => setViewport(newViewport), [])

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 }

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      })
    },
    [handleViewportChange]
  )

  return (
    <div style={{ height: '100vh' }}>
      <div ref={geocoderContainerRef} style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }} />
      <MapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        onViewportChange={handleViewportChange}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <Geocoder
          mapRef={mapRef}
          containerRef={geocoderContainerRef}
          onViewportChange={handleGeocoderViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          position="top-left"
        />
      </MapGL>
    </div>
  )
}
