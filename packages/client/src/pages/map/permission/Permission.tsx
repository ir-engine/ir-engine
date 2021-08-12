import React, { Component } from 'react'
import styles from './Permission.module.scss'
import MapSvg from './MapSvg.svg'
import Bcg from './background.png'
// import ''

const handleOpenMap = () => {}

// document.body.style.backgroundImage = "url(Bcg)";

const LocationPermission = () => {
  return (
    <div className={styles.main}>
      <img className={styles.bcg} src={Bcg} alt="Bcg"></img>
      <div className={styles.grayBlock}>
        <span className={styles.bigText}>
          Allow “App” to use <br /> your location?
        </span>
        <span className={styles.text}>
          Your precise location is used to show your position on the map, get directions, estimate travel times and
          improve search results{' '}
        </span>
        {/* <MapSvg className={styles.map}/>  */}
        <img className={styles.map} src={MapSvg} alt="MapSvg"></img>
        <button className={styles.button} onClick={handleOpenMap}>
          Allow once
        </button>
        <button className={styles.button} onClick={handleOpenMap}>
          Allow while using this app
        </button>
        <button className={styles.button} onClick={handleOpenMap}>
          Don`t allow
        </button>
      </div>
    </div>
  )
}

export default LocationPermission
