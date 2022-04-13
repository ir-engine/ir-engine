import { Downgraded } from '@speigg/hookstate'
import { useHistory } from 'react-router-dom'
import { Quaternion, Vector3 } from 'three'
import matches from 'ts-matches'

import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/services/AppService'
import { accessProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { ClientTransportHandler } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import { accessSceneState } from '@xrengine/client-core/src/world/services/SceneService'
import { SceneData, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { EngineActions, EngineActionType } from '@xrengine/engine/src/ecs/classes/EngineService'
import { initSystems, SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import {
  initializeCoreSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { updateNearbyAvatars } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'

export const retrieveLocationByName = (authState: AuthState, locationName: string) => {
  if (authState.isLoggedIn.value === true && authState.user.id.value) {
    if (locationName === globalThis.process.env['VITE_LOBBY_LOCATION_NAME']) {
      const history = useHistory()
      LocationService.getLobby()
        .then((lobby) => {
          history.replace('/location/' + lobby?.slugifiedName)
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
  await initializeCoreSystems(injectedSystems)
}

export const initClient = async (sceneData: SceneData) => {
  const systems = getSystemsFromSceneData(sceneData.project, sceneData.scene, true)
  const projects = accessProjectState().projects.value.map((project) => project.name)
  const world = useWorld()

  await Promise.all([
    initializeRealtimeSystems(),
    initializeSceneSystems(),
    initSystems(world, systems),
    loadEngineInjection(world, projects)
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

export const loadLocation = (sceneData: SceneJson) => {
  const dispatch = useDispatch()
  // 4. Start scene loading
  dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))
  loadSceneFromJSON(sceneData).then(() => {
    getPortalDetails()
    dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  })
}
