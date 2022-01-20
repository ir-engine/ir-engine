import React from 'react'
import { LoadEngineWithScene } from '../../components/World/LoadEngineWithScene'
import { LoadLocationScene } from '../../components/World/LoadLocationScene'

const LocationPage = (props) => {
  return (
    <>
      <LoadLocationScene locationName={props.match.params.locationName} />
      <LoadEngineWithScene />
    </>
  )
}

export default LocationPage
