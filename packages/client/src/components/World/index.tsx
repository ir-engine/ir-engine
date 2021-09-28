import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { EngineCallbacks, initEngine, retriveLocationByName, teleportToLocation } from './LocationLoadHelper'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import DefaultLayoutView from './DefaultLayoutView'
import NetworkInstanceProvisioning from './NetworkInstanceProvisioning'

const engineRendererCanvasId = 'engine-renderer-canvas'

const getDefaulEngineInitializeOptions = (): InitializeOptions => {
  return {
    publicPath: location.origin,
    networking: {
      schema: {
        transport: SocketWebRTCClientTransport
      } as NetworkSchema
    },
    renderer: {
      canvasId: engineRendererCanvasId
    },
    physics: {
      simulationEnabled: false
    }
  }
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
  allowDebug?: boolean
  locationState?: any
  partyState?: any
  history?: any
  engineInitializeOptions?: InitializeOptions
  instanceConnectionState?: any
  showTouchpad?: boolean
  children?: any
  chatState?: any
  // todo: remove these props in favour of reality packs
  customComponents?: any
  theme?: any
  hideVideo?: boolean
  hideFullscreen?: boolean
}

const mapStateToProps = (state: any) => {
  return {
    locationState: selectLocationState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({})

export const EnginePage = (props: Props) => {
  const [isUserBanned, setUserBanned] = useState(true)
  const [isValidLocation, setIsValidLocation] = useState(true)
  const [isInXR, setIsInXR] = useState(false)
  const [isTeleporting, setIsTeleporting] = useState(false)
  const [newSpawnPos, setNewSpawnPos] = useState<ReturnType<typeof PortalComponent.get>>(null)
  const authState = useAuthState()
  const engineInitializeOptions = Object.assign({}, getDefaulEngineInitializeOptions(), props.engineInitializeOptions)
  const [sceneId, setSceneId] = useState(null)

  const [loadingItemCount, setLoadingItemCount] = useState(99)

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: () => setLoadingItemCount(0)
  }

  useEffect(() => {
    addUIEvents()
    if (!engineInitializeOptions.networking.schema.transport) {
      init(props.locationName)
    }
  }, [])

  useEffect(() => {
    checkForBan()
    if (!isUserBanned && !props.locationState.get('fetchingCurrentLocation')) {
      retriveLocationByName(authState, props.locationName, history)
    }
  }, [authState.isLoggedIn.value, authState.user.id.value])

  useEffect(() => {
    return (): void => {
      shutdownEngine()
    }
  }, [])

  const checkForBan = (): void => {
    const selfUser = authState.user
    const currentLocation = props.locationState.get('currentLocation').get('location')

    const isUserBanned = selfUser?.locationBans?.value?.find((ban) => ban.locationId === currentLocation.id) != null
    setUserBanned(isUserBanned)
  }

  const reinit = () => {
    const currentLocation = props.locationState.get('currentLocation').get('location')
    if (sceneId === null && currentLocation.sceneId !== null) {
      setSceneId(currentLocation.sceneId)
    }
    init(sceneId)
  }

  const init = async (sceneId: string): Promise<any> => {
    initEngine(sceneId, engineInitializeOptions, newSpawnPos, engineCallbacks)
    setIsTeleporting(false)
  }

  const portToLocation = async ({ portalComponent }: { portalComponent: ReturnType<typeof PortalComponent.get> }) => {
    const slugifiedName = props.locationState.get('currentLocation').get('location').slugifiedName

    teleportToLocation(portalComponent, slugifiedName, () => {
      setIsTeleporting(true)

      // change our browser URL
      props.history.replace('/location/' + portalComponent.location)
      setNewSpawnPos(portalComponent)
    })
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT, portToLocation)
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_START, async () => {
      setIsInXR(true)
    })
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_END, async () => {
      setIsInXR(false)
    })
  }

  if (isUserBanned) return <div className="banned">You have been banned from this location</div>

  if (isInXR) return <></>

  return (
    <>
      <NetworkInstanceProvisioning
        locationName={props.locationName}
        sceneId={sceneId}
        setSceneId={setSceneId}
        reinit={reinit}
        isUserBanned={isUserBanned}
        setIsValidLocation={setIsValidLocation}
      />
      <DefaultLayoutView
        canvasElement={canvas}
        loadingItemCount={loadingItemCount}
        isValidLocation={isValidLocation}
        allowDebug={props.allowDebug}
        reinit={reinit}
        children={props.children}
        showTouchpad={props.showTouchpad}
        isTeleporting={isTeleporting}
        locationName={props.locationName}
        // todo: remove these props in favour of reality packs
        customComponents={props.customComponents}
        theme={props.theme}
        hideVideo={props.hideVideo}
        hideFullscreen={props.hideFullscreen}
      />
    </>
  )
}

const connector = connect(mapStateToProps, mapDispatchToProps)(EnginePage)

export default connector
