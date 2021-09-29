import React from 'react'
import World from '../../components/World'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

const LocationPage = (props) => {
  const engineInitializeOptions: InitializeOptions = {
    systems: [
      {
        type: SystemUpdateType.FIXED,
        systemModulePromise: import('./GolfSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./GolfXRUISystem')
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
