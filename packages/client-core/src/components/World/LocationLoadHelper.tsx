import { Downgraded } from '@speigg/hookstate'
import { Quaternion, Vector3 } from 'three'
import matches from 'ts-matches'

import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/services/AppService'
import { accessProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { ClientTransportHandler } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import { accessSceneState } from '@xrengine/client-core/src/world/services/SceneService'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { EngineActions, EngineActionType } from '@xrengine/engine/src/ecs/classes/EngineService'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import {
  createEngine,
  initializeBrowser,
  initializeCoreSystems,
  initializeProjectSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { updateNearbyAvatars } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'

export const retriveLocationByName = (authState: any, locationName: string, history: any) => {
  if (
    authState.isLoggedIn?.value === true &&
    authState.user?.id?.value != null &&
    authState.user?.id?.value.length > 0
  ) {
    if (locationName === globalThis.process.env['VITE_LOBBY_LOCATION_NAME']) {
      LocationService.getLobby()
        .then((lobby) => {
          history.replace('/location/' + lobby.slugifiedName)
        })
        .catch((err) => console.log('getLobby error', err))
    } else {
      LocationService.getLocationByName(locationName)
    }
  }
}

const getFirstSpawnPointFromSceneData = (scene: SceneJson) => {
  for (const entity of Object.values(scene.entities)) {
    if (entity.name != 'spawn point') continue

    for (const component of entity.components) {
      if (component.name === 'transform') {
        return component.props.position
      }
    }
  }

  console.warn('Could not find spawn point from scene data')
  return { x: 0, y: 0, z: 0 }
}

const createOfflineUser = (sceneData: SceneJson) => {
  const avatarDetail = {
    thumbnailURL: '',
    avatarURL: ''
  }

  const spawnPos = getFirstSpawnPointFromSceneData(sceneData)

  const userId = 'user' as UserId
  const parameters = {
    position: new Vector3().copy(spawnPos),
    rotation: new Quaternion()
  }

  const world = useWorld()
  world.hostId = userId as any

  // it is needed by AvatarSpawnSystem
  Engine.userId = userId
  // Replicate the server behavior
  dispatchLocal(NetworkWorldAction.createClient({ name: 'user', index: 0 }) as any)
  dispatchLocal(NetworkWorldAction.spawnAvatar({ parameters, ownerIndex: 0 }))
  dispatchLocal(NetworkWorldAction.avatarDetails({ avatarDetail }))
}

const injectedSystems: SystemModuleType<any>[] = [
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('@xrengine/client-core/src/systems/XRUILoadingSystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('@xrengine/client-core/src/systems/AvatarUISystem')
  }
]

export const initEngine = async () => {
  if (Engine.isInitialized) return
  Network.instance.transportHandler = new ClientTransportHandler()
  createEngine()
  initializeBrowser()
  await initializeCoreSystems(injectedSystems)
}

export const initClient = async (project) => {
  const sceneData = accessSceneState().currentScene.scene.attach(Downgraded).value!
  const systems = getSystemsFromSceneData(project, sceneData, true)
  const projects = accessProjectState().projects.value.map((project) => project.name)

  await Promise.all([
    initializeRealtimeSystems(),
    initializeSceneSystems(),
    initializeProjectSystems(projects, systems)
  ])

  // add extraneous receptors
  useWorld().receptors.push((action) => {
    matches(action)
      .when(NetworkWorldAction.createClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
      .when(NetworkWorldAction.destroyClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
  })
  Engine.isReady = true
}

export const loadLocation = () => {
  dispatchLocal(EngineActions.loadingStateChanged(0, 'Loading Objects'))

  const dispatch = useDispatch()

  // 4. Start scene loading
  dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))
  let entitiesToLoad = 0

  const receptor = (action: EngineActionType) => {
    switch (action.type) {
      case EngineEvents.EVENTS.SCENE_ENTITY_LOADED:
        const entitesCompleted = entitiesToLoad - Engine.sceneLoadPromises.length
        const message = Engine.sceneLoadPromises.length ? 'Loading Objects' : 'Loading Complete'
        dispatchLocal(EngineActions.loadingStateChanged(Math.round((100 * entitesCompleted) / entitiesToLoad), message))
        break
    }
  }
  Engine.currentWorld.receptors.push(receptor)

  const sceneData = accessSceneState().currentScene.scene.attach(Downgraded).value!
  loadSceneFromJSON(sceneData).then(() => {
    dispatchLocal(EngineActions.loadingStateChanged(100, 'Joining World'))

    getPortalDetails()
    dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  })

  entitiesToLoad = Engine.sceneLoadPromises.length
}
