import { XR360PlayerPage } from '../components/Scene/360/page'
import React from 'react'

const LocationPage = (props) => {
  return (
    <>
      <XR360PlayerPage locationName={props.match.params.locationName} />
    </>
  )
}

export default LocationPage
