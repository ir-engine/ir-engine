import { LocationAction, useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { initEngine, loadLocation } from './LocationLoadHelper'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { InstanceConnectionService } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { teleportToScene } from '@xrengine/engine/src/scene/functions/teleportToScene'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { getWorldTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { leave } from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'

const engineRendererCanvasId = 'engine-renderer-canvas'

const defaultEngineInitializeOptions = {
  publicPath: location.origin,
  physics: {
    simulationEnabled: false
  },
  systems: [
    {
      type: 'FIXED',
      systemModulePromise: import('@xrengine/client-core/src/systems/AvatarUISystem')
    }
  ]
}

const canvasStyle = {
  zIndex: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  WebkitUserSelect: 'none',
  userSelect: 'none'
} as React.CSSProperties

const canvas = <canvas id={engineRendererCanvasId} style={canvasStyle} />

interface Props {
  engineInitializeOptions?: InitializeOptions
  setLoadingItemCount?: any
}

export const LoadEngineWithScene = (props: Props) => {
  const locationState = useLocationState()
  const history = useHistory()
  const dispatch = useDispatch()
  const engineState = useEngineState()

  useEffect(() => {
    const engineInitializeOptions = Object.assign({}, defaultEngineInitializeOptions, props.engineInitializeOptions)
    if (!Engine.isInitialized) initEngine(engineInitializeOptions)
    addUIEvents()
  }, [])

  /**
   * Once we have the scene ID, initialise the engine
   */
  useEffect(() => {
    if (locationState.currentLocation.location.sceneId.value && engineState.isInitialised.value) {
      loadLocation(locationState.currentLocation.location.sceneId.value)
    }
  }, [locationState.currentLocation.location.sceneId.value, engineState.isInitialised.value])

  const portToLocation = async ({ portalComponent }: { portalComponent: ReturnType<typeof PortalComponent.get> }) => {
    dispatchLocal(EngineActions.setTeleporting(portalComponent))
    dispatch(LocationAction.fetchingCurrentSocialLocation())

    // TODO: this needs to be implemented on the server too
    // if (slugifiedNameOfCurrentLocation === portalComponent.location) {
    //   teleportPlayer(
    //     useWorld().localClientEntity,
    //     portalComponent.remoteSpawnPosition,
    //     portalComponent.remoteSpawnRotation
    //   )
    //   return
    // }

    // shut down connection with existing GS
    console.log('reseting connection for tp')
    leave(getWorldTransport())
    InstanceConnectionService.resetInstanceServer()

    await teleportToScene(portalComponent, async () => {
      history.push('/location/' + portalComponent.location)
      LocationService.getLocationByName(portalComponent.location)
    })
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT, portToLocation)
  }

  return canvas
}
