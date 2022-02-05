import React from 'react'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import { LoadLocationScene } from '@xrengine/client-core/src/components/World/LoadLocationScene'

const LocationPage = (props) => {
  return (
    <>
      <LoadLocationScene locationName={props.match.params.locationName} />
      <LoadEngineWithScene />
    </>
  )
}

export default LocationPage
