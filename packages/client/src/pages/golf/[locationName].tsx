import React from 'react'
import World from '../../components/World'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'

const LocationPage = (props) => {
  const engineInitializeOptions: InitializeOptions = {
    systems: [
      {
        injectionPoint: 'FIXED',
        system: import('./GolfSystem')
      },
      {
        injectionPoint: 'PRE_RENDER',
        system: import('./GolfXRUISystem')
      }
    ]
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
