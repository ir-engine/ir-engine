import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/reducers/app/AppActions'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { selectPartyState } from '@xrengine/client-core/src/social/reducers/party/selector'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { UserService } from '@xrengine/client-core/src/user/store/UserService'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import querystring from 'querystring'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import url from 'url'
import { selectInstanceConnectionState } from '../../reducers/instanceConnection/selector'
import { provisionInstanceServer, resetInstanceServer } from '../../reducers/instanceConnection/service'
import { EngineCallbacks, initEngine, retriveLocationByName, teleportToLocation } from './LocationLoadHelper'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { selectChatState } from '@xrengine/client-core/src/social/reducers/chat/selector'
import { provisionChannelServer } from '../../reducers/channelConnection/service'
import DefaultLayoutView from './DefaultLayoutView'
import Layout from '../Layout/Layout'
import { useTranslation } from 'react-i18next'

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
  //doLoginAuto?: typeof doLoginAuto
  provisionChannelServer?: typeof provisionChannelServer
  provisionInstanceServer?: typeof provisionInstanceServer
  resetInstanceServer?: typeof resetInstanceServer
  showTouchpad?: boolean
  children?: any
  chatState?: any
}

const mapStateToProps = (state: any) => {
  return {
    // appState: selectAppState(state),

    instanceConnectionState: selectInstanceConnectionState(state), //
    locationState: selectLocationState(state),
    partyState: selectPartyState(state),
    chatState: selectChatState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  //doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  provisionChannelServer: bindActionCreators(provisionChannelServer, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  resetInstanceServer: bindActionCreators(resetInstanceServer, dispatch)
})

export const EnginePage = (props: Props) => {
  const { t } = useTranslation()
  const [isUserBanned, setUserBanned] = useState(true)
  const [isValidLocation, setIsValidLocation] = useState(true)
  const [isInXR, setIsInXR] = useState(false)
  const [isTeleporting, setIsTeleporting] = useState(false)
  const [newSpawnPos, setNewSpawnPos] = useState<ReturnType<typeof PortalComponent.get>>(null)
  const authState = useAuthState()
  const selfUser = authState.user
  const engineInitializeOptions = Object.assign({}, getDefaulEngineInitializeOptions(), props.engineInitializeOptions)
  let sceneId = null

  const [loadingItemCount, setLoadingItemCount] = useState(99)

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: () => setLoadingItemCount(0)
  }

  const userState = useUserState()
  const dispatch = useDispatch()

  useEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value === true)
      dispatch(UserService.getLayerUsers(true))
    if (selfUser?.channelInstanceId.value != null && userState.channelLayerUsersUpdateNeeded.value === true)
      dispatch(UserService.getLayerUsers(false))
  }, [selfUser, userState.layerUsersUpdateNeeded.value, userState.channelLayerUsersUpdateNeeded.value])

  useEffect(() => {
    addUIEvents()
    if (!engineInitializeOptions.networking.schema.transport) {
      init(props.locationName)
    } else {
      dispatch(AuthService.doLoginAuto(true))
      EngineEvents.instance.addEventListener(EngineEvents.EVENTS.RESET_ENGINE, async (ev: any) => {
        if (!ev.instance) return

        await shutdownEngine()
        props.resetInstanceServer()

        if (!isUserBanned) {
          retriveLocationByName(authState, props.locationName, history)
        }
      })
    }
  }, [])

  useEffect(() => {
    checkForBan()
    if (!isUserBanned && !props.locationState.get('fetchingCurrentLocation')) {
      retriveLocationByName(authState, props.locationName, history)
    }
  }, [authState.isLoggedIn.value, authState.user.id.value])

  useEffect(() => {
    const currentLocation = props.locationState.get('currentLocation').get('location')

    if (currentLocation.id) {
      if (
        !isUserBanned &&
        !props.instanceConnectionState.get('instanceProvisioned') &&
        !props.instanceConnectionState.get('instanceProvisioning')
      ) {
        const search = window.location.search
        let instanceId

        if (search != null) {
          const parsed = url.parse(window.location.href)
          const query = querystring.parse(parsed.query)
          instanceId = query.instanceId
        }

        if (sceneId === null) sceneId = currentLocation.sceneId
        props.provisionInstanceServer(currentLocation.id, instanceId || undefined, sceneId)
      }

      if (sceneId === null) sceneId = currentLocation.sceneId
    } else {
      if (
        !props.locationState.get('currentLocationUpdateNeeded') &&
        !props.locationState.get('fetchingCurrentLocation')
      ) {
        setIsValidLocation(false)
        dispatch(AppAction.setAppSpecificOnBoardingStep(GeneralStateList.FAILED, false))
      }
    }
  }, [props.locationState])

  useEffect(() => {
    if (
      props.instanceConnectionState.get('instanceProvisioned') &&
      props.instanceConnectionState.get('updateNeeded') &&
      !props.instanceConnectionState.get('instanceServerConnecting') &&
      !props.instanceConnectionState.get('connected')
    ) {
      reinit()
    }
  }, [props.instanceConnectionState])

  useEffect(() => {
    if (props.chatState.get('instanceChannelFetched')) {
      const channels = props.chatState.get('channels').get('channels')
      const instanceChannel = [...channels.entries()].find((channel) => channel[1].channelType === 'instance')
      props.provisionChannelServer(null, instanceChannel[0])
    }
  }, [props.chatState.get('instanceChannelFetched')])

  useEffect(() => {
    return (): void => {
      shutdownEngine()
    }
  }, [])

  // TODO: Is this still is use
  // useEffect(() => {
  //   if (
  //     appLoaded &&
  //     !props.instanceConnectionState.get('instanceProvisioned') &&
  //     !props.instanceConnectionState.get('instanceProvisioning')
  //   ) {
  //     if (!instanceId) return

  //     client
  //       .service('instance')
  //       .get(instanceId)
  //       .then((instance) => {
  //         const currentLocation = props.locationState.get('currentLocation').get('location')
  //         props.provisionInstanceServer(instance.locationId, instanceId, currentLocation.sceneId)
  //         if (sceneId === null) {
  //           console.log('Set scene ID to', sceneId)
  //           sceneId = currentLocation.sceneId
  //         }
  //       })
  //       .catch((err) => console.log('instance get error', err))
  //   }
  // }, [appState])

  const checkForBan = (): void => {
    const selfUser = authState.user
    const currentLocation = props.locationState.get('currentLocation').get('location')

    const isUserBanned = selfUser?.locationBans?.value?.find((ban) => ban.locationId === currentLocation.id) != null
    setUserBanned(isUserBanned)
  }

  const reinit = () => {
    const currentLocation = props.locationState.get('currentLocation').get('location')
    if (sceneId === null && currentLocation.sceneId !== null) {
      sceneId = currentLocation.sceneId
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
      <DefaultLayoutView
        partyState={props.partyState}
        canvasElement={canvas}
        loadingItemCount={loadingItemCount}
        isValidLocation={isValidLocation}
        allowDebug={props.allowDebug}
        reinit={reinit}
        children={props.children}
        showTouchpad={props.showTouchpad}
        isTeleporting={isTeleporting}
        locationName={props.locationName}
      />
    </>
  )
}

const connector = connect(mapStateToProps, mapDispatchToProps)(EnginePage)

export default connector
