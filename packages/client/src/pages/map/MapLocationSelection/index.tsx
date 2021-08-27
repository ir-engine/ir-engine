/*import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import './mapbox-gl-geocoder-override.css'
import React, { useState, useRef, useCallback } from 'react'
import MapGL from 'react-map-gl'
import Geocoder from 'react-map-gl-geocoder'
import styles from './MapLocation.module.scss'
const mapboxApiKey = 'pk.eyJ1IjoibmF2ZGVlcHlhZGF2IiwiYSI6ImNrc2EzM2pnejBqaWUyeHA0bW8xaXFwaWEifQ.hIpiYzWrUer4F31GpCqoHA'
const mapStyle = {
  width: '100%',
  height: '45vh'
}

interface Props {}

const MapView = (props: Props) => {
  const [state, setState] = useState({
    viewport: {
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
    },
    selectedLocation: null,
    selectedMarkerIndex: null,
    markers: []
  })

  const mapRef = useRef()

  const handleViewportChange = useCallback((newViewport) => {
    setState({
      ...state,
      viewport: newViewport,
      selectedLocation: newViewport
    })
  }, [])

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 }
      console.log('Selected Location Position:')
      console.log(newViewport)
      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      })
    },
    [handleViewportChange]
  )

  const { viewport, selectedLocation, markers, selectedMarkerIndex } = state
  return (
    <div className={styles.locationSearch}>
      <div className={styles.mapglView}>
        <MapGL
          ref={mapRef}
          mapboxApiAccessToken={mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          {...viewport}
          {...mapStyle}
          onViewportChange={handleViewportChange}
        >
          {
            <Geocoder
              mapRef={mapRef}
              mapboxApiAccessToken={mapboxApiKey}
              onViewportChange={handleGeocoderViewportChange}
              placeholder={'Where would you like to go?'}
              position="top-left"
              limit={3}
            />
          }
        </MapGL>
      </div>
    </div>
  )
}

export default MapView*/


import "mapbox-gl/dist/mapbox-gl.css"
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import React, { useState, useRef, useCallback } from 'react'
import MapGL, {Marker, Popup } from 'react-map-gl';
import {Button  } from 'reactstrap';
import Geocoder from 'react-mapbox-gl-geocoder'
import './mapbox-gl-geocoder-override.css'
import styles from './MapLocation.module.scss'

const mapboxApiKey = 'pk.eyJ1IjoibmF2ZGVlcHlhZGF2IiwiYSI6ImNrc2EzM2pnejBqaWUyeHA0bW8xaXFwaWEifQ.hIpiYzWrUer4F31GpCqoHA'


const mapStyle = {
    width: '100%',
    height: '100%'
}

//// popup to be appear on pin click

const CustomPopup = ({index, marker, closePopup,remove}) => {
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
  )};

  ////MArker to be set on user position
  const CustomMarker = ({index, marker, openPopup}) => {
    return (
      <Marker
        longitude={marker.longitude}
        latitude={marker.latitude}>
        <div className="marker" onClick={() => openPopup(index)}>          
          <img className="location-icon" src="./asset/pin.PNG"/>
        </div>
      </Marker>
  )};

//Class map view

interface Props {}

const MapView = (props: Props) => {
//class MapView extends Component {

  //We are using array here for marker becuase we can set multiple popup in future
  //User location is used to mark user location
  const [state, setState] = useState({
      viewport: {
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 8
      },
      tempMarker: null,
      selectedMarkerIndex: null,
      markers:[],
      userLocation: {},
    };
    


// to be called to set user location when map load
const setUserLocation = () => {
  navigator.geolocation.getCurrentPosition(position => {
     let setUserLocation = {
         lat: position.coords.latitude,
         long: position.coords.longitude
      };
     let newViewport = {       
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        zoom: 8
      };
      let  tempMarker= {
        name: "My location",
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      };
      setState({
        viewport: newViewport,
        userLocation: setUserLocation
     });
     setState(prevState => ({
        markers: [...prevState.markers, tempMarker],
        tempMarker: null
      }));
  });
};

////////////////////////////////////////////////////////////////////////////////////





  const mapRef = React.createRef();
  const geocoderContainerRef = React.createRef();

  // this will be used to move on selected place from search result
  const onSelected = (viewport, item) => {
      setState({
        viewport,
        tempMarker: {
          name: item.place_name,
          longitude: item.center[0],
          latitude: item.center[1]
        },
        item:null
      })
     
  }

  //Right now these are disabled because we are setting only on PIN
  //To add new pin
  const add = () => {
    var { tempMarker } = state

    setState(prevState => ({
        markers: [...prevState.markers, tempMarker],
        tempMarker: null
    }))
  }
//Set selected pin
  const setSelectedMarker = (index) => {
      setState({ selectedMarkerIndex: index })
  }
  // close the opened popup
  const closePopup = () => {
      setSelectedMarker(null)
  };
  // To open the popup
  const openPopup = (index) => {
      setSelectedMarker(index)
  }
  // To remove the popup
  const remove = (index) => {   
    setState(prevState => ({
      markers: prevState.markers.filter((marker, i) => index !== i),
      selectedMarkerIndex: null
    }))
  }

  // This will be used to check click event on map
  // The approach that is used here is to remove previous PIN and add new pin on selected place
  const onClickMap=(evt)=> {
    console.log('Map clicked! ', +evt);
    
    setState(prevState => ({
      markers: prevState.markers.filter((marker) => marker.name  !== "My location"),
      selectedMarkerIndex: null
    }))

    let newViewport = {       
      latitude:evt.lngLat[1],
      longitude: evt.lngLat[0],
      zoom: 8
    };
    let  tempMarker= {
      name: "My location",
      longitude:  evt.lngLat[0],
      latitude:  evt.lngLat[1]
    };
    setState({
      viewport: newViewport,    
    });
    setState(prevState => ({
      markers: [...prevState.markers, tempMarker],
      tempMarker: null
    }));
   console.log(state.markers);
  }

 
    const { viewport, tempMarker, markers,selectedMarkerIndex } = state;
    return(
      <div style={{ height: "100vh" }}>
        <div style={{height:"35%"}}>
          <div style={{height:"25%"}}>

          </div>
          <div  ref={geocoderContainerRef} style={{marginLeft:"5%", marginRight:"5%", marginBottom:"3%", marginTop:"40%"}}>
          <Geocoder
              mapboxApiAccessToken={mapboxApiKey}
              mapRef={mapRef}
              onSelected={onSelected}
              viewport={viewport}
              hideOnSelect={true}
              containerRef={geocoderContainerRef}
              position="top-left"
              value="search"
              />
          </div>           
        </div>
        <div className="mapholder" >  
          <MapGL
          
            ref={mapRef}
            mapboxApiAccessToken={mapboxApiKey}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            {...viewport}
            {...mapStyle}
            onViewportChange={(viewport) => setState({viewport})}
            onClick={_onClickMap}
            onLoad={setUserLocation} >
            
            { tempMarker!==null &&
              <Marker              
                longitude={tempMarker.longitude}
                latitude={tempMarker.latitude}>               
                <div className="marker temporary-marker"><span></span></div>
              </Marker>
            }
            {
              state.markers.map((marker, index) => {
                return(
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
      </div>
   );
  }


  export default MapView
