
import "mapbox-gl/dist/mapbox-gl.css"
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import React, { Component, createRef, useState } from 'react';
import { render } from "react-dom";
import MapGL, { Marker, Popup } from 'react-map-gl';
import Geocoder from 'react-mapbox-gl-geocoder';
import { Button } from '@material-ui/core'

const mapboxApiKey = 'pk.eyJ1IjoibmF2ZGVlcHlhZGF2IiwiYSI6ImNrc2EzM2pnejBqaWUyeHA0bW8xaXFwaWEifQ.hIpiYzWrUer4F31GpCqoHA'

const mapStyle = {
  width: '100%',
  height: '100vh'
}

const CustomPopup = ({ index, marker, closePopup, remove }) => {
  return (
    <Popup
      latitude={marker.latitude}
      longitude={marker.longitude}
      onClose={closePopup}
      closeButton={true}
      closeOnClick={false}
      offsetTop={-30}
    >
      <p>{marker.name}</p>
      <div>
        <Button color="secondary" onClick={() => remove(index)}>Remove</Button>
        <Button color="secondary" >GO!</Button>
      </div>
    </Popup>
  )
};

const CustomMarker = ({ index, marker, openPopup }) => {
  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}>
      <div className="marker" onClick={() => openPopup(index)}>
        <span><b>{index + 1 + "  Marker"}</b></span>
      </div>
    </Marker>
  )
};

const MapView = (props) => {
  const [state, setState] = useState({
    viewport: {
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
    },
    tempMarker: null,
    selectedMarkerIndex: null,
    markers: []
  })

  const mapRef = createRef()

  const onSelected = (viewport, item) => {
    setState({
      ...state,
      viewport,
      tempMarker: {
        name: item.place_name,
        longitude: item.center[0],
        latitude: item.center[1]
      }
    })
  }

  const add = () => {
    setState({
      ...state,
      markers: [...state.markers, state.tempMarker],
      tempMarker: null
    })
  }

  const setSelectedMarker = (index) => {
    setState({ ...state, selectedMarkerIndex: index })
  }

  const closePopup = () => {
    setSelectedMarker(null)
  }

  const openPopup = (index) => {
    setSelectedMarker(index)
  }

  const remove = (index) => {
    setState({
      ...state,
      markers: state.markers.filter((marker, i) => index !== i),
      selectedMarkerIndex: null
    })
  }

    const { viewport, tempMarker, markers, selectedMarkerIndex } = state;
    return (
      <div style={{ height: "100vh" }}>
        <MapGL
          ref={mapRef}
          mapboxApiAccessToken={mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          {...viewport}
          {...mapStyle}
          onViewportChange={(viewport) => setState({...state, viewport })} >
          {
            <Geocoder
              mapboxApiAccessToken={mapboxApiKey}
              mapRef={mapRef}
              onSelected={onSelected}
              viewport={viewport}
              hideOnSelect={true}
              value=""
              position="top-left"
            />
          }
          {
            <Button color="primary" onClick={add}>Add</Button>
          }
          {tempMarker &&
            <Marker
              longitude={tempMarker.longitude}
              latitude={tempMarker.latitude}>
              <div className="marker temporary-marker"><span></span></div>
            </Marker>
          }
          {
            state.markers.map((marker, index) => {
              return (
                <CustomMarker
                  key={`marker-${index}`}
                  index={index}
                  marker={marker}
                  openPopup={openPopup}
                />
              )
            })
          }
          {
            selectedMarkerIndex !== null &&
            <CustomPopup
              index={selectedMarkerIndex}
              marker={markers[selectedMarkerIndex]}
              closePopup={closePopup}
              remove={remove}
            />
          }
        </MapGL>
      </div>
    );
}

render(<MapView />, document.getElementById("root"));