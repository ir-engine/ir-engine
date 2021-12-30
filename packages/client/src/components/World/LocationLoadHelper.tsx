import { GeneralStateList, AppAction } from '@xrengine/client-core/src/common/services/AppService'
import { Config } from '@xrengine/common/src/config'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { ClientTransportHandler } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { Vector3, Quaternion } from 'three'
import { getSystemsFromSceneData } from '@xrengine/projects/loader'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { EngineActions, EngineActionType } from '@xrengine/engine/src/ecs/classes/EngineService'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'

export const retriveLocationByName = (authState: any, locationName: string, history: any) => {
  if (
    authState.isLoggedIn?.value === true &&
    authState.user?.id?.value != null &&
    authState.user?.id?.value.length > 0
  ) {
    if (locationName === Config.publicRuntimeConfig.lobbyLocationName) {
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
  dispatchLocal(NetworkWorldAction.createClient({ name: 'user' }))
  dispatchLocal(NetworkWorldAction.spawnAvatar({ parameters }))
  dispatchLocal(NetworkWorldAction.avatarDetails({ avatarDetail }))
}

export const initEngine = async (initOptions: InitializeOptions) => {
  Engine.isLoading = true
  Network.instance = new Network()
  Network.instance.transportHandler = new ClientTransportHandler()
  await initializeEngine(initOptions)
}

export const loadLocation = async (project: string, sceneData: SceneJson): Promise<any> => {
  dispatchLocal(EngineActions.loadingStateChanged(5, 'fetching systems...'))
  const packs = await getSystemsFromSceneData(project, sceneData, true)

  dispatchLocal(EngineActions.loadingStateChanged(10, 'loading systems into the world...'))
  await Engine.currentWorld.initSystems(packs)
  const dispatch = useDispatch()

  dispatchLocal(EngineActions.loadingStateChanged(30, 'loading scene into the world...'))
  // 4. Start scene loading
  dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))

  await loadSceneFromJSON(sceneData)
  dispatchLocal(EngineActions.loadingStateChanged(100, 'Loading Complete!'))

  getPortalDetails()
  dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  Engine.isLoading = false
}
