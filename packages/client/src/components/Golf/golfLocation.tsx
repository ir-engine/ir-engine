import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import {
  GeneralStateList,
  setAppLoaded,
  setAppOnBoardingStep,
  setAppSpecificOnBoardingStep
} from '@xrengine/client-core/src/common/reducers/app/actions'
import { selectAppState } from '@xrengine/client-core/src/common/reducers/app/selector'
import { selectDeviceDetectState } from '@xrengine/client-core/src/common/reducers/devicedetect/selector'
import { client } from '@xrengine/client-core/src/feathers'
import { Config } from '@xrengine/client-core/src/helper'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { getLobby, getLocationByName } from '@xrengine/client-core/src/social/reducers/location/service'
import { selectPartyState } from '@xrengine/client-core/src/social/reducers/party/selector'
import Store from '@xrengine/client-core/src/store'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
// import { setCurrentScene } from '@xrengine/client-core/src/world/reducers/scenes/actions'
import { SceneAction } from '@xrengine/client-core/src/world/store/SceneAction'
import { testScenes } from '@xrengine/common/src/assets/testScenes'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { initializeEngine, shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem'
import querystring from 'querystring'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import url from 'url'
import MediaIconsBox from '../MediaIconsBox'
import NetworkDebug from '../NetworkDebug'
import { selectInstanceConnectionState } from '../../reducers/instanceConnection/selector'
import {
  connectToInstanceServer,
  provisionInstanceServer,
  resetInstanceServer
} from '../../reducers/instanceConnection/service'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import WarningRefreshModal from '../AlertModals/WarningRetryModal'
import { unregisterSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { GolfSystem } from '@xrengine/engine/src/game/templates/Golf/GolfSystem'
import { AnimationSystem } from '@xrengine/engine/src/avatar/AnimationSystem'
import { GolfGameMode } from '@xrengine/engine/src/game/templates/GolfGameMode'
import { registerGolfBotHooks } from '@xrengine/engine/src/game/templates/Golf/functions/registerGolfBotHooks'
import { GameManagerSystem } from '@xrengine/engine/src/game/systems/GameManagerSystem'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

const store = Store.store

const goHome = () => (window.location.href = window.location.origin)

const engineRendererCanvasId = 'engine-renderer-canvas'
const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/

const initialRefreshModalValues = {
  open: false,
  title: '',
  body: '',
  action: async () => {},
  parameters: [],
  timeout: 10000,
  noCountdown: false
}

const canvasStyle = {
  zIndex: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  WebkitUserSelect: 'none',
  userSelect: 'none'
} as React.CSSProperties

interface Props {
  setAppLoaded?: any
  sceneId?: string
  deviceState?: any
  locationName: string
  appState?: any
  authState?: any
  locationState?: any
  partyState?: any
  history?: any
  instanceConnectionState?: any
  doLoginAuto?: typeof doLoginAuto
  getLocationByName?: typeof getLocationByName
  connectToInstanceServer?: typeof connectToInstanceServer
  provisionInstanceServer?: typeof provisionInstanceServer
  resetInstanceServer?: typeof resetInstanceServer
  setCurrentScene?: typeof SceneAction.setCurrentScene
  harmonyOpen?: boolean
}

const mapStateToProps = (state: any) => {
  return {
    appState: selectAppState(state),
    deviceState: selectDeviceDetectState(state),
    authState: selectAuthState(state),
    instanceConnectionState: selectInstanceConnectionState(state),
    locationState: selectLocationState(state),
    partyState: selectPartyState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAppLoaded: bindActionCreators(setAppLoaded, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  getLocationByName: bindActionCreators(getLocationByName, dispatch),
  connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  resetInstanceServer: bindActionCreators(resetInstanceServer, dispatch),
  setCurrentScene: bindActionCreators(SceneAction.setCurrentScene, dispatch)
})

let slugifiedName = null

export const EnginePage = (props: Props) => {
  const {
    appState,
    authState,
    locationState,
    partyState,
    deviceState,
    instanceConnectionState,
    doLoginAuto,
    getLocationByName,
    connectToInstanceServer,
    provisionInstanceServer,
    resetInstanceServer,
    setCurrentScene,
    setAppLoaded,
    locationName,
    harmonyOpen,
    history
  } = props

  const [userBanned, setUserBannedState] = useState(false)

  const [progressEntity, setProgressEntity] = useState(99)

  const [isValidLocation, setIsValidLocation] = useState(true)
  const [isInXR, setIsInXR] = useState(false)
  const [warningRefreshModalValues, setWarningRefreshModalValues] = useState(initialRefreshModalValues)
  const [noGameserverProvision, setNoGameserverProvision] = useState(false)
  const [instanceDisconnected, setInstanceDisconnected] = useState(false)
  const [instanceKicked, setInstanceKicked] = useState(false)
  const [instanceKickedMessage, setInstanceKickedMessage] = useState('')
  const [porting, setPorting] = useState(false)

  const appLoaded = appState.get('loaded')
  const selfUser = authState.get('user')
  const party = partyState.get('party')
  const instanceId = selfUser?.instanceId ?? party?.instanceId
  const invalidLocation = locationState.get('invalidLocation')
  let sceneId = null
  let locationId = null

  useEffect(() => {
    if (Config.publicRuntimeConfig.offlineMode) {
      init(locationName)
    } else {
      doLoginAuto(true)
      EngineEvents.instance.addEventListener(
        SocketWebRTCClientTransport.EVENTS.PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE,
        () => setNoGameserverProvision(true)
      )
      EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.INSTANCE_DISCONNECTED, () => {
        if ((Network.instance.transport as SocketWebRTCClientTransport).left === false) setInstanceDisconnected(true)
      })
      EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.INSTANCE_KICKED, ({ message }) => {
        setInstanceKickedMessage(message)
        setInstanceKicked(true)
      })
      EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.INSTANCE_RECONNECTED, () =>
        setWarningRefreshModalValues(initialRefreshModalValues)
      )
      EngineEvents.instance.addEventListener(EngineEvents.EVENTS.RESET_ENGINE, async (ev: any) => {
        if (ev.instance === true) {
          await shutdownEngine()
          resetInstanceServer()
          const currentLocation = locationState.get('currentLocation').get('location')
          locationId = currentLocation.id
          if (locationName === Config.publicRuntimeConfig.lobbyLocationName) {
            getLobby()
              .then((lobby) => {
                history.replace('/location/' + lobby.slugifiedName)
              })
              .catch((err) => console.log('getLobby error', err))
          } else {
            getLocationByName(locationName)
            if (sceneId === null) {
              sceneId = currentLocation.sceneId
            }
          }
        }
      })
    }
  }, [])

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location')
    locationId = currentLocation.id

    setUserBannedState(selfUser?.locationBans?.find((ban) => ban.locationId === locationId) != null)
    if (
      authState.get('isLoggedIn') === true &&
      authState.get('user')?.id != null &&
      authState.get('user')?.id.length > 0 &&
      currentLocation.id == null &&
      userBanned === false &&
      locationState.get('fetchingCurrentLocation') !== true
    ) {
      if (locationName === Config.publicRuntimeConfig.lobbyLocationName) {
        getLobby()
          .then((lobby) => {
            history.replace('/location/' + lobby.slugifiedName)
          })
          .catch((err) => console.log('getLobby error', err))
      } else {
        getLocationByName(locationName)
        if (sceneId === null) {
          sceneId = currentLocation.sceneId
        }
      }
    }
  }, [authState])

  useEffect(() => {
    const currentLocation = locationState.get('currentLocation').get('location')
    slugifiedName = currentLocation.slugifiedName
    if (
      currentLocation.id != null &&
      userBanned != true &&
      instanceConnectionState.get('instanceProvisioned') === false &&
      instanceConnectionState.get('instanceProvisioning') === false
    ) {
      const search = window.location.search
      let instanceId
      if (search != null) {
        const parsed = url.parse(window.location.href)
        const query = querystring.parse(parsed.query)
        instanceId = query.instanceId
      }
      provisionInstanceServer(currentLocation.id, instanceId || undefined, sceneId)
    }
    if (sceneId === null) {
      sceneId = currentLocation.sceneId
    }

    if (
      !currentLocation.id &&
      !locationState.get('currentLocationUpdateNeeded') &&
      !locationState.get('fetchingCurrentLocation')
    ) {
      setIsValidLocation(false)
      store.dispatch(setAppSpecificOnBoardingStep(GeneralStateList.FAILED, false))
    }
  }, [locationState])

  useEffect(() => {
    if (
      instanceConnectionState.get('instanceProvisioned') === true &&
      instanceConnectionState.get('updateNeeded') === true &&
      instanceConnectionState.get('instanceServerConnecting') === false &&
      instanceConnectionState.get('connected') === false
    ) {
      reinit()
    }
  }, [instanceConnectionState])

  useEffect(() => {
    if (
      appLoaded === true &&
      instanceConnectionState.get('instanceProvisioned') === false &&
      instanceConnectionState.get('instanceProvisioning') === false
    ) {
      if (instanceId != null) {
        client
          .service('instance')
          .get(instanceId)
          .then((instance) => {
            const currentLocation = locationState.get('currentLocation').get('location')
            provisionInstanceServer(instance.locationId, instanceId, currentLocation.sceneId)
            if (sceneId === null) {
              console.log('Set scene ID to', sceneId)
              sceneId = currentLocation.sceneId
            }
          })
          .catch((err) => console.log('instance get error', err))
      }
    }
  }, [appState])

  // If user if on Firefox in Private Browsing mode, throw error, since they can't use db storage currently
  useEffect(() => {
    var db = indexedDB.open('test')
    db.onerror = function () {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'Browser Error',
        body: 'Your browser does not support storage in private browsing mode. Either try another browser, or exit private browsing mode. ',
        noCountdown: true
      }
      setWarningRefreshModalValues(newValues)
      setInstanceDisconnected(false)
    }
  }, [])

  useEffect(() => {
    if (noGameserverProvision === true) {
      const currentLocation = locationState.get('currentLocation').get('location')
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'No Available Servers',
        body: "There aren't any servers available for you to connect to. Attempting to re-connect in",
        action: async () => {
          provisionInstanceServer()
        },
        parameters: [currentLocation.id, instanceId, currentLocation.sceneId],
        timeout: 10000
      }
      setWarningRefreshModalValues(newValues)
      setNoGameserverProvision(false)
    }
  }, [noGameserverProvision])

  useEffect(() => {
    if (instanceDisconnected === true && !porting) {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'World disconnected',
        body: "You've lost your connection with the world. We'll try to reconnect before the following time runs out, otherwise you'll be forwarded to a different instance.",
        action: async () => window.location.reload(),
        parameters: [],
        timeout: 30000
      }
      setWarningRefreshModalValues(newValues)
      setInstanceDisconnected(false)
    }
  }, [instanceDisconnected])

  useEffect(() => {
    if (instanceKicked === true) {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: "You've been kicked from the world",
        body: 'You were kicked from this world for the following reason: ' + instanceKickedMessage,
        noCountdown: true
      }
      setWarningRefreshModalValues(newValues)
      setInstanceDisconnected(false)
    }
  }, [instanceKicked])

  useEffect(() => {
    if (invalidLocation === true) {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'Invalid location',
        body: `We can't find the location '${locationName}'. It may be misspelled, or it may not exist.`,
        noCountdown: true
      }
      setWarningRefreshModalValues(newValues)
    }
  }, [invalidLocation])

  const reinit = () => {
    const currentLocation = locationState.get('currentLocation').get('location')
    if (sceneId === null && currentLocation.sceneId !== null) {
      sceneId = currentLocation.sceneId
    }
    init(sceneId)
  }

  async function init(sceneId: string): Promise<any> {
    // auth: any,
    let sceneData
    if (Config.publicRuntimeConfig.offlineMode) {
      sceneData = testScenes[sceneId] || testScenes.test
    } else {
      let service, serviceId
      const projectResult = await client.service('project').get(sceneId)
      setCurrentScene(projectResult)
      const projectUrl = projectResult.project_url
      const regexResult = projectUrl.match(projectRegex)
      if (regexResult) {
        service = regexResult[1]
        serviceId = regexResult[2]
      }
      sceneData = await client.service(service).get(serviceId)
    }

    if (!Engine.isInitialized) {
      const initializationOptions: InitializeOptions = {
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
          simulationEnabled: false,
          physxWorker: new Worker('/scripts/loadPhysXClassic.js')
        },
        systems: [
          {
            system: GolfSystem,
            after: GameManagerSystem
          }
        ]
      }

      await initializeEngine(initializationOptions)
      registerGolfBotHooks()

      // TODO: find a better way to do this
      unregisterSystem(SystemUpdateType.Fixed, AnimationSystem)

      document.dispatchEvent(new CustomEvent('ENGINE_LOADED')) // this is the only time we should use document events. would be good to replace this with react state
      addUIEvents()
    }

    if (!Config.publicRuntimeConfig.offlineMode) await connectToInstanceServer('instance')

    const connectPromise = new Promise<void>((resolve) => {
      EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, resolve)
    })
    store.dispatch(setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))

    const sceneLoadPromise = new Promise<void>((resolve) => {
      WorldScene.load(
        sceneData,
        () => {
          setProgressEntity(0)
          store.dispatch(setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
          setAppLoaded(true)
          resolve()
        },
        onSceneLoadedEntity
      )
    })

    await Promise.all([connectPromise, sceneLoadPromise])

    await new Promise<void>(async (resolve) => {
      const { worldState } = await (Network.instance.transport as SocketWebRTCClientTransport).instanceRequest(
        MessageTypes.JoinWorld.toString()
      )

      Network.instance.incomingMessageQueueReliable.add(worldState)
      resolve()
    })

    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
    store.dispatch(setAppOnBoardingStep(GeneralStateList.SUCCESS))
    setPorting(false)
  }

  const onSceneLoadedEntity = (left: number): void => {
    setProgressEntity(left || 0)
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_START, async () => {
      setIsInXR(true)
    })
    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_END, async () => {
      setIsInXR(false)
    })
  }

  useEffect(() => {
    return (): void => {
      shutdownEngine()
    }
  }, [])

  if (userBanned) return <div className="banned">You have been banned from this location</div>
  return isInXR ? (
    <></>
  ) : (
    <>
      {isValidLocation && <UserMenu />}
      <Snackbar
        open={!isValidLocation}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <>
          <section>Location is invalid</section>
          <Button onClick={goHome}>Return Home</Button>
        </>
      </Snackbar>

      <NetworkDebug reinit={reinit} />
      <LoadingScreen objectsToLoad={progressEntity} />
      {harmonyOpen !== true && <MediaIconsBox />}
      <canvas id={engineRendererCanvasId} style={canvasStyle} />
      <WarningRefreshModal
        open={warningRefreshModalValues.open && !porting}
        handleClose={() => {
          setWarningRefreshModalValues(initialRefreshModalValues)
        }}
        title={warningRefreshModalValues.title}
        body={warningRefreshModalValues.body}
        action={warningRefreshModalValues.action}
        parameters={warningRefreshModalValues.parameters}
        timeout={warningRefreshModalValues.timeout}
        noCountdown={warningRefreshModalValues.noCountdown}
      />
    </>
  )
}

const connector = connect(mapStateToProps, mapDispatchToProps)(EnginePage)

export default connector
