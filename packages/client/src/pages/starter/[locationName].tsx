import React from 'react'
import World from '../../components/World'

const LocationPage = (props) => {
  return <World allowDebug={true} locationName={props.match.params.locationName} history={props.history} />
}

export default LocationPage
