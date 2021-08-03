import React from 'react'
import "./LocationPermissions.scss";
import { ReactComponent as MapSvg } from './MapSvg.svg';

const handleOpenMap = () => {

}

export default function NewUserPrompt() {
  return (
    <div>
      <div className="grayBlock">
      <span className="bigText">Allow “App” to use <br /> your location?</span>
      <span className="text">Your precise location is used to show your position on the map, get directions, estimate travel times and improve search results </span>
        <MapSvg className="map"/> 
        <button className="button" onClick={handleOpenMap}>Allow once</button> 
        <button className="button"  onClick={handleOpenMap}>Allow while using this app</button>
        <button className="button" onClick={handleOpenMap}>Don`t allow</button>
      </div>
    </div>
  )
}
