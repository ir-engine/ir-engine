import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { loadLocation, teleportToLocation } from './LocationLoadHelper'
import { EngineAction } from '@xrengine/client-core/src/world/services/EngineService'

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
    },
    {
      type: 'FIXED',
      systemModulePromise: import('@xrengine/client-core/src/proximity/systems/ProximitySystem')
    },
    {
      type: 'FIXED',
      systemModulePromise: import('@xrengine/client-core/src/webcam/systems/WebCamInputSystem')
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
  connectToInstanceServer?: boolean
  setLoadingItemCount?: any
}

export const LoadEngineWithScene = (props: Props) => {
  const [newSpawnPos, setNewSpawnPos] = useState<ReturnType<typeof PortalComponent.get>>(null!)
  const locationState = useLocationState()
  const connectToInstanceServer = props.connectToInstanceServer !== undefined ? props.connectToInstanceServer : true
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    addUIEvents()
  }, [])

  /**
   * Once we have the scene ID, initialise the engine
   */
  useEffect(() => {
    if (locationState.currentLocation.location.sceneId.value) {
      console.log('init', locationState.currentLocation.location.sceneId.value)
      dispatch(EngineAction.setTeleporting(false))
      const engineInitializeOptions = Object.assign({}, defaultEngineInitializeOptions, props.engineInitializeOptions)
      loadLocation(
        locationState.currentLocation.location.sceneId.value,
        engineInitializeOptions,
        newSpawnPos,
        connectToInstanceServer
      )
    }
  }, [locationState.currentLocation.location.sceneId.value])

  const portToLocation = async ({ portalComponent }: { portalComponent: ReturnType<typeof PortalComponent.get> }) => {
    const slugifiedName = locationState.currentLocation.location.slugifiedName.value

    teleportToLocation(portalComponent, slugifiedName, () => {
      dispatch(EngineAction.setTeleporting(true))

      // change our browser URL
      history.push('/location/' + portalComponent.location)
      setNewSpawnPos(portalComponent)
    })
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT, portToLocation)
  }

  return canvas
}
