import { GeneralStateList, AppAction } from '@xrengine/client-core/src/common/reducers/app/AppActions'
import { client } from '@xrengine/client-core/src/feathers'
import { Config } from '@xrengine/common/src/config'
import { LocationService } from '@xrengine/client-core/src/social/reducers/location/LocationService'
import Store from '@xrengine/client-core/src/store'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import { SceneAction } from '@xrengine/client-core/src/world/reducers/scenes/ScreenActions'
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
import { InstanceConnectionService } from '../../reducers/instanceConnection/InstanceConnectionService'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { Vector3, Quaternion } from 'three'
import type { SceneData } from '@xrengine/common/src/interfaces/SceneData'
import { getPacksFromSceneData } from '@xrengine/projects/loader'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { dispatchFrom } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import React from 'react'

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
      Store.store.dispatch(LocationService.getLocationByName(locationName))
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

  const projectResult = await client.service('scene').get(sceneId)
  Store.store.dispatch(SceneAction.setCurrentScene(projectResult))

  const projectUrl = projectResult.project_url
  const regexResult = projectUrl.match(projectRegex)

  let service, serviceId
  if (regexResult) {
    service = regexResult[1]
    serviceId = regexResult[2]
  }

  return client.service(service).get(serviceId) as SceneData
}

const createOfflineUser = () => {
  const avatarDetail = {
    thumbnailURL: '',
    avatarURL: '',
    avatarId: ''
  } as any

  const userId = 'user' as UserId
  const parameters = {
    position: new Vector3(0.18393396470500378, 0, 0.2599274866972079),
    rotation: new Quaternion()
  }

  // it is needed by AvatarSpawnSystem
  Engine.userId = userId
  // Replicate the server behavior
  const world = useWorld()
  dispatchFrom(world.hostId, () => NetworkWorldAction.createClient({ userId, name: 'user', avatarDetail }))
  dispatchFrom(world.hostId, () => NetworkWorldAction.spawnAvatar({ userId, parameters }))
}

export const initEngine = async (
  sceneId: string,
  initOptions: InitializeOptions,
  newSpawnPos?: ReturnType<typeof PortalComponent.get>,
  engineCallbacks?: EngineCallbacks
): Promise<any> => {
  // 1.
  const isOffline = false // TODO
  const sceneData = await getSceneData(sceneId, isOffline)

  const packs = await getPacksFromSceneData(sceneData, true)

  for (const system of packs.systems) {
    initOptions.systems?.push(system)
  }

  const projectReactComponents = packs.react.map((c) => React.lazy(() => c))

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
  if (!isOffline) {
    const didConnect = new Promise<void>((resolve) => {
      EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, resolve)
    })
    await Promise.all([Store.store.dispatch(InstanceConnectionService.connectToInstanceServer('instance')), didConnect])
  }

  if (typeof engineCallbacks?.onConnectedToServer === 'function') {
    engineCallbacks.onConnectedToServer()
  }

  // 4. Start scene loading
  Store.store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))

  console.log('Awaiting scene load')

  await WorldScene.load(sceneData, engineCallbacks?.onSceneLoadProgress)

  getPortalDetails()
  Store.store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  Store.store.dispatch(AppAction.setAppLoaded(true))

  // 5. Join to new world
  if (!isOffline) {
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

  if (isOffline) {
    createOfflineUser()
  }

  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })

  if (typeof engineCallbacks?.onJoinedToNewWorld === 'function') {
    engineCallbacks.onJoinedToNewWorld()
  }

  // 6. Dispatch success
  Store.store.dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SUCCESS))

  if (typeof engineCallbacks?.onSuccess === 'function') {
    engineCallbacks.onSuccess()
  }

  return projectReactComponents
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
  Store.store.dispatch(InstanceConnectionService.resetInstanceServer())
  Network.instance.transport.close()

  await teleportToScene(portalComponent, async () => {
    onTeleport()
    Store.store.dispatch(LocationService.getLocationByName(portalComponent.location))
  })
}
