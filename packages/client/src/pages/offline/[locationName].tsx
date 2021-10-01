import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import React from 'react'
import { DefaultNetworkSchema } from '@xrengine/engine/src/networking/templates/DefaultNetworkSchema'
import World from '../../components/World'

const engineInitializeOptions: InitializeOptions = {}

const LocationPage = (props) => {
  // Disable networking if no location is provided
  if (!props.match.params.locationName) {
    engineInitializeOptions.networking = { schema: DefaultNetworkSchema }
  }

  return (
    <World
      allowDebug={true}
      locationName={props.match.params.locationName}
      history={props.history}
      engineInitializeOptions={engineInitializeOptions}
    />
  )
}

export default LocationPage
