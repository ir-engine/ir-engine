import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import React from 'react'
import { DefaultNetworkSchema } from '@xrengine/engine/src/networking/templates/DefaultNetworkSchema'
import { LoadEngineWithScene } from '../../components/World/LoadEngineWithScene'
import { LoadLocationScene } from '../../components/World/LoadLocationScene'

const engineInitializeOptions: InitializeOptions = {}

const LocationPage = (props) => {
  // Disable networking if no location is provided
  if (!props.match.params.locationName) {
    engineInitializeOptions.networking = { schema: DefaultNetworkSchema }
  }

  return (
    <>
      <LoadLocationScene locationName={props.match.params.locationName} />
      <LoadEngineWithScene engineInitializeOptions={engineInitializeOptions} />
    </>
  )
}

export default LocationPage
