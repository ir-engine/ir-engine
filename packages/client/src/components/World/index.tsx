import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { EngineCallbacks, initEngine, retriveLocationByName, teleportToLocation } from './LocationLoadHelper'
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
  locationName: string
  history?: any
  engineInitializeOptions?: InitializeOptions
  connectToInstanceServer?: boolean
  setSceneId?: any
  setUserBanned?: any
  setLoadingItemCount?: any
  getEngineInitFunc?: any
  reinit?: any
}

export const EnginePage = (props: Props) => {
  const { t } = useTranslation()
  const [isUserBanned, setUserBanned] = useState(false)
  const [newSpawnPos, setNewSpawnPos] = useState<ReturnType<typeof PortalComponent.get>>(null!)
  const authState = useAuthState()
  const [scene, setScene] = useState('')
  const locationState = useLocationState()
  const connectToInstanceServer = props.connectToInstanceServer !== undefined ? props.connectToInstanceServer : true
  const [engineInitialized, setEngineInitialized] = useState(false)
  const history = useHistory()
  const dispatch = useDispatch()

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    if (typeof props.setSceneId === 'function') props.setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: () => onSceneLoadProgress(0)
  }

  const init = async (): Promise<any> => {
    console.log('init', scene)
    dispatch(EngineAction.setTeleporting(false))
    setEngineInitialized(true)
    const engineInitializeOptions = Object.assign({}, defaultEngineInitializeOptions, props.engineInitializeOptions)
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
    console.log(scene)
    if (locationState.currentLocation.location.sceneId.value) {
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
  }, [scene])

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
      dispatch(EngineAction.setTeleporting(true))

      // change our browser URL
      history.push('/location/' + portalComponent.location)
      setNewSpawnPos(portalComponent)
    })
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT, portToLocation)
  }

  if (isUserBanned) return <div className="banned">{t('location.youHaveBeenBannedMsg')}</div>

  // Do not add/remove the canvas element after engine init
  // It will break internal references and prevent XR session to work properly
  return canvas
}

export default EnginePage
