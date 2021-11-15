import { GeneralStateList, AppAction } from '@xrengine/client-core/src/common/services/AppService'
import { client } from '@xrengine/client-core/src/feathers'
import { Config } from '@xrengine/common/src/config'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { store, useDispatch } from '@xrengine/client-core/src/store'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
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
import { getPacksFromSceneData } from '@xrengine/projects/loader'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { InstanceConnectionService } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { EngineAction } from '@xrengine/client-core/src/world/services/EngineService'

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

export const getSceneData = async (scene: string, isOffline: boolean): Promise<SceneJson> => {
  if (isOffline) {
    return testScenes[scene] || testScenes.test
  }

  const [projectName, sceneName] = scene.split('/')

  const sceneResult = await client.service('scene').get({ projectName, sceneName })
  console.log(sceneResult)
  return sceneResult.data.scene
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

export const initEngine = async (initOptions: InitializeOptions) => {
  Network.instance.transport = new SocketWebRTCClientTransport()
  await initializeEngine(initOptions)
  const dispatch = useDispatch()
  dispatch(EngineAction.setInitialised(false))
}

export const loadLocation = async (
  sceneName: string,
  initOptions: InitializeOptions,
  newSpawnPos?: ReturnType<typeof PortalComponent.get>,
  connectToInstanceServer: boolean = true
): Promise<any> => {
  // 1.
  const sceneData = await getSceneData(sceneName, false)

  const packs = await getPacksFromSceneData(sceneData, true)

  for (const system of packs.systems) {
    initOptions.systems?.push(system)
  }

  // 2. Initialize Engine if not initialized
  if (!Engine.isInitialized) {
    await initEngine(initOptions)
  }

  // 3. Connect to server
  if (connectToInstanceServer) {
    const didConnect = new Promise<void>((resolve) => {
      EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, resolve)
    })
    await Promise.all([InstanceConnectionService.connectToInstanceServer('instance'), didConnect])
  }

  // 4. Start scene loading
  store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))

  console.log('Awaiting scene load')

  const dispatch = useDispatch()
  await WorldScene.load(sceneData, (count: number) => {
    dispatch(EngineAction.loadingProgress(count))
  })

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

  // 6. Dispatch success
  store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SUCCESS))
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
  Network.instance.transport.close(true, false)
  InstanceConnectionService.resetInstanceServer()

  await teleportToScene(portalComponent, async () => {
    onTeleport()
    LocationService.getLocationByName(portalComponent.location)
  })
}
