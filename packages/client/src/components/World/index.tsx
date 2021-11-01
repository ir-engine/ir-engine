import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import React, { useEffect, useState } from 'react'
import { EngineCallbacks, initEngine, retriveLocationByName, teleportToLocation } from './LocationLoadHelper'

const engineRendererCanvasId = 'engine-renderer-canvas'

const defaultEngineInitializeOptions = {
  publicPath: location.origin,
  renderer: {
    canvasId: engineRendererCanvasId
  },
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
  locationName: string
  history?: any
  engineInitializeOptions?: InitializeOptions
  connectToInstanceServer?: boolean
  setSceneId?: any
  setUserBanned?: any
  setLoadingItemCount?: any
  setIsTeleporting?: any
  getEngineInitFunc?: any
  reinit?: any
}

export const EnginePage = (props: Props) => {
  const [isUserBanned, setUserBanned] = useState(true)
  const [newSpawnPos, setNewSpawnPos] = useState<ReturnType<typeof PortalComponent.get>>(null!)
  const authState = useAuthState()
  const engineInitializeOptions = Object.assign({}, defaultEngineInitializeOptions, props.engineInitializeOptions)
  const [scene, setScene] = useState('')
  const locationState = useLocationState()
  const connectToInstanceServer = props.connectToInstanceServer !== undefined ? props.connectToInstanceServer : true
  const setIsTeleporting = typeof props.setIsTeleporting === 'function' ? props.setIsTeleporting : () => {}

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    if (typeof props.setSceneId === 'function') props.setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: () => onSceneLoadProgress(0)
  }

  const init = async (): Promise<any> => {
    console.log('init', scene)
    setIsTeleporting(false)
    await initEngine(scene, engineInitializeOptions, newSpawnPos, engineCallbacks, connectToInstanceServer)
  }

  /**
   * Log in & initialise flow...
   *
   * 1. Try to log in
   */
  useEffect(() => {
    addUIEvents()
    AuthService.doLoginAuto(true)
    return (): void => {
      shutdownEngine()
    }
  }, [])

  /**
   * 2. Once we have logged in, retrieve the location data
   */
  useEffect(() => {
    checkForBan()
    if (!isUserBanned && !locationState.fetchingCurrentLocation.value) {
      retriveLocationByName(authState, props.locationName, history)
    }
  }, [authState.isLoggedIn.value, authState.user.id.value])

  /**
   * 3. Once we have the location data, set the scene ID
   */
  useEffect(() => {
    if (scene === '' && locationState.currentLocation.location.sceneId.value) {
      const id = locationState.currentLocation.location.sceneId.value
      setScene(id)
      if (typeof props.setSceneId === 'function') props.setSceneId(id)
    }
  }, [locationState.currentLocation.location.sceneId.value])

  /**
   * 4. Once we have the scene ID, initialise the engine
   */
  useEffect(() => {
    if (scene) {
      init()
    }
  }, [scene, props.reinit])

  const checkForBan = (): void => {
    const selfUser = authState.user
    const currentLocation = locationState.currentLocation.location

    const isUserBanned =
      selfUser?.locationBans?.value?.find((ban) => ban.locationId === currentLocation.id.value) != null
    setUserBanned(isUserBanned)

    if (typeof props.setUserBanned === 'function') props.setUserBanned(isUserBanned)
  }

  const portToLocation = async ({ portalComponent }: { portalComponent: ReturnType<typeof PortalComponent.get> }) => {
    const slugifiedName = locationState.currentLocation.location.slugifiedName.value

    teleportToLocation(portalComponent, slugifiedName, () => {
      setIsTeleporting(true)

      // change our browser URL
      props.history.replace('/location/' + portalComponent.location)
      setNewSpawnPos(portalComponent)
    })
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT, portToLocation)
  }

  if (isUserBanned) return <div className="banned">You have been banned from this location</div>

  // Do not add/remove the canvas element after engine init
  // It will break internal references and prevent XR session to work properly
  return canvas
}

export default EnginePage
