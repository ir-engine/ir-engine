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
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { setCurrentScene } from '@xrengine/client-core/src/world/reducers/scenes/actions'
import { testUserId, testWorldState } from '@xrengine/common/src/assets/testScenes'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { initializeEngine, shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem'
import querystring from 'querystring'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import url from 'url'
import { selectInstanceConnectionState } from '../../reducers/instanceConnection/selector'
import {
  connectToInstanceServer,
  provisionInstanceServer,
  resetInstanceServer
} from '../../reducers/instanceConnection/service'
import MediaIconsBox from '../../components/MediaIconsBox'
import NetworkDebug from '../../components/NetworkDebug'
import { delay } from 'lodash'
import { ClientNetworkStateSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkStateSystem'
import { Network } from '../../../../engine/src/networking/classes/Network'

const store = Store.store

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
  setCurrentScene?: typeof setCurrentScene
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
  setCurrentScene: bindActionCreators(setCurrentScene, dispatch)
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

  const currentUser = authState.get('user')
  const [userBanned, setUserBannedState] = useState(false)
  const [progressEntity, setProgressEntity] = useState(99)

  const [isValidLocation, setIsValidLocation] = useState(true)
  const [isInXR, setIsInXR] = useState(false)
  const [warningRefreshModalValues, setWarningRefreshModalValues] = useState(initialRefreshModalValues)
  const [noGameserverProvision, setNoGameserverProvision] = useState(false)
  const [instanceDisconnected, setInstanceDisconnected] = useState(false)
  const [instanceKicked, setInstanceKicked] = useState(false)
  const [instanceKickedMessage, setInstanceKickedMessage] = useState('')

  const appLoaded = appState.get('loaded')
  const selfUser = authState.get('user')
  const party = partyState.get('party')
  const instanceId = selfUser?.instanceId ?? party?.instanceId
  let sceneId = null
  let locationId = null

  useEffect(() => {
    doLoginAuto(true)
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
    if (instanceDisconnected === true) {
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

    const initializationOptions: InitializeOptions = {
      publicPath: location.origin,
      renderer: {
        canvasId: engineRendererCanvasId
      },
      physics: {
        simulationEnabled: false,
        physxWorker: new Worker('/scripts/loadPhysXClassic.js')
      }
    }

    await initializeEngine(initializationOptions)

    document.dispatchEvent(new CustomEvent('ENGINE_LOADED'))
    addUIEvents()

    EngineEvents.instance.dispatchEvent({ type: ClientNetworkStateSystem.EVENTS.CONNECT, id: testUserId })

    store.dispatch(setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))

    await new Promise<void>((resolve) => {
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

    await new Promise<void>((resolve) => delay(resolve, 1000))
    Network.instance.incomingMessageQueueReliable.add(testWorldState)
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
    await new Promise<void>((resolve) => delay(resolve, 1000))

    store.dispatch(setAppOnBoardingStep(GeneralStateList.SUCCESS))
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

  return isInXR ? (
    <></>
  ) : (
    <>
      <MediaIconsBox />
      <NetworkDebug reinit={reinit} />
      <canvas id={engineRendererCanvasId} style={canvasStyle} />
    </>
  )
}

const connector = connect(mapStateToProps, mapDispatchToProps)(EnginePage)

export default connector
