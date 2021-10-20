import React from 'react'
import World from '../../components/World/index'

const LocationPage = (props) => {
  return <World allowDebug={true} locationName={props.match.params.locationName} history={props.history} showTouchpad />
}

export default LocationPage
