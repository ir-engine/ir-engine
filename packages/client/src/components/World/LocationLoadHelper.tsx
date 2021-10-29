import { GeneralStateList, AppAction } from '@xrengine/client-core/src/common/state/AppService'
import { client } from '@xrengine/client-core/src/feathers'
import { Config } from '@xrengine/common/src/config'
import { LocationService } from '@xrengine/client-core/src/social/state/LocationService'
import { store } from '@xrengine/client-core/src/store'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import { SceneAction } from '@xrengine/client-core/src/world/state/SceneService'
import { testScenes } from '@xrengine/common/src/assets/testScenes'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { teleportToScene } from '@xrengine/engine/src/scene/functions/teleportToScene'
import { SocketWebRTCClientTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { Vector3, Quaternion } from 'three'
import type { SceneData } from '@xrengine/common/src/interfaces/SceneData'
import { getPacksFromSceneData } from '@xrengine/projects/loader'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { InstanceConnectionService } from '@xrengine/client-core/src/common/state/InstanceConnectionService'

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/

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

export type EngineCallbacks = {
  onEngineInitialized?: Function
  onConnectedToServer?: Function
  onSceneLoaded?: Function
  onSceneLoadProgress?: Function
  onJoinedToNewWorld?: Function
  onSuccess?: Function
}

export const getSceneData = async (sceneId: string, isOffline: boolean): Promise<SceneData> => {
  if (isOffline) {
    return testScenes[sceneId] || testScenes.test
  }

  const sceneResult = await client.service('scene').get(sceneId)
  store.dispatch(SceneAction.setCurrentScene(sceneResult))

  const sceneUrl = sceneResult.scene_url
  const regexResult = sceneUrl.match(projectRegex)

  let service, serviceId
  if (regexResult) {
    service = regexResult[1]
    serviceId = regexResult[2]
  }

  return client.service(service).get(serviceId) as SceneData
}

const getFirstSpawnPointFromSceneData = (scene: SceneData) => {
  for (const entity of Object.values(scene.entities)) {
    if (entity.name != 'spawn point') continue

    for (const component of entity.components) {
      if (component.type === 'transform') {
        return component.props.position
      }
    }
  }

  console.warn('Could not find spawn point from scene data')
  return { x: 0, y: 0, z: 0 }
}

const createOfflineUser = (sceneData: SceneData) => {
  const avatarDetail = {
    thumbnailURL: '',
    avatarURL: '',
    avatarId: ''
  } as any

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
  dispatchLocal(NetworkWorldAction.createClient({ userId, name: 'user', avatarDetail }) as any)
  dispatchLocal(NetworkWorldAction.spawnAvatar({ userId, parameters }) as any)
}

export const initEngine = async (
  sceneId: string,
  initOptions: InitializeOptions,
  newSpawnPos?: ReturnType<typeof PortalComponent.get>,
  engineCallbacks?: EngineCallbacks,
  connectToInstanceServer: boolean = true
): Promise<any> => {
  // 1.
  const sceneData = await getSceneData(sceneId, false)

  const packs = await getPacksFromSceneData(sceneData, true)

  for (const system of packs.systems) {
    initOptions.systems?.push(system)
  }

  // 2. Initialize Engine if not initialized
  if (!Engine.isInitialized) {
    console.log('initEngine')
    Network.instance.transport = new SocketWebRTCClientTransport()
    await initializeEngine(initOptions)
    document.dispatchEvent(new CustomEvent('ENGINE_LOADED')) // this is the only time we should use document events. would be good to replace this with react state

    if (typeof engineCallbacks?.onEngineInitialized === 'function') {
      engineCallbacks.onEngineInitialized()
    }
  }

  // 3. Connect to server
  if (connectToInstanceServer) {
    const didConnect = new Promise<void>((resolve) => {
      EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, resolve)
    })
    await Promise.all([InstanceConnectionService.connectToInstanceServer('instance'), didConnect])
  }

  if (typeof engineCallbacks?.onConnectedToServer === 'function') {
    engineCallbacks.onConnectedToServer()
  }

  // 4. Start scene loading
  store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))

  console.log('Awaiting scene load')

  await WorldScene.load(sceneData, engineCallbacks?.onSceneLoadProgress)

  getPortalDetails()
  store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  store.dispatch(AppAction.setAppLoaded(true))

  // 5. Join to new world
  if (connectToInstanceServer) {
    // TEMPORARY - just so portals work for now - will be removed in favor of gameserver-gameserver communication
    let spawnTransform
    if (newSpawnPos) {
      spawnTransform = { position: newSpawnPos.remoteSpawnPosition, rotation: newSpawnPos.remoteSpawnRotation }
    }

    await (Network.instance.transport as SocketWebRTCClientTransport).instanceRequest(
      MessageTypes.JoinWorld.toString(),
      { spawnTransform }
    )
  }

  if (!connectToInstanceServer) {
    createOfflineUser(sceneData)
  }

  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })

  if (typeof engineCallbacks?.onJoinedToNewWorld === 'function') {
    engineCallbacks.onJoinedToNewWorld()
  }

  // 6. Dispatch success
  store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SUCCESS))

  if (typeof engineCallbacks?.onSuccess === 'function') {
    engineCallbacks.onSuccess()
  }
}

export const teleportToLocation = async (
  portalComponent: ReturnType<typeof PortalComponent.get>,
  slugifiedNameOfCurrentLocation: string,
  onTeleport: Function
) => {
  // TODO: this needs to be implemented on the server too
  // if (slugifiedNameOfCurrentLocation === portalComponent.location) {
  //   teleportPlayer(
  //     useWorld().localClientEntity,
  //     portalComponent.remoteSpawnPosition,
  //     portalComponent.remoteSpawnRotation
  //   )
  //   return
  // }

  // shut down connection with existing GS
  InstanceConnectionService.resetInstanceServer()
  Network.instance.transport.close()

  await teleportToScene(portalComponent, async () => {
    onTeleport()
    LocationService.getLocationByName(portalComponent.location)
  })
}
