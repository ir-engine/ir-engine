import { Config } from '@xrengine/client-core/src/helper'
import { getLobby, getLocationByName } from '@xrengine/client-core/src/social/reducers/location/service'
import Store from '@xrengine/client-core/src/store'
import { testScenes } from '@xrengine/common/src/assets/testScenes'
import { client } from '@xrengine/client-core/src/feathers'
import { setCurrentScene } from '@xrengine/client-core/src/world/reducers/scenes/actions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import {
  GeneralStateList,
  setAppLoaded,
  setAppOnBoardingStep
} from '@xrengine/client-core/src/common/reducers/app/actions'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { teleportToScene } from '@xrengine/engine/src/scene/functions/teleportToScene'
import { processLocationChange } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { teleportPlayer } from '@xrengine/engine/src/avatar/functions/teleportPlayer'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import configs from '@xrengine/client-core/src/world/components/editor/configs'

import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { connectToInstanceServer, resetInstanceServer } from '../../reducers/instanceConnection/service'
import { EngineCallbacks } from './'

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/

export const retriveLocationByName = (authState: any, locationName: string, history: any) => {
  if (
    authState.get('isLoggedIn') === true &&
    authState.get('user')?.id != null &&
    authState.get('user')?.id.length > 0
  ) {
    if (locationName === Config.publicRuntimeConfig.lobbyLocationName) {
      getLobby()
        .then((lobby) => {
          history.replace('/location/' + lobby.slugifiedName)
        })
        .catch((err) => console.log('getLobby error', err))
    } else {
      Store.store.dispatch(getLocationByName(locationName))
    }
  }
}

export const getSceneData = async (sceneId: string, isOffline: boolean) => {
  if (isOffline) {
    return testScenes[sceneId] || testScenes.test
  }

  const projectResult = await client.service('project').get(sceneId)
  Store.store.dispatch(setCurrentScene(projectResult))

  const projectUrl = projectResult.project_url
  const regexResult = projectUrl.match(projectRegex)

  let service, serviceId
  if (regexResult) {
    service = regexResult[1]
    serviceId = regexResult[2]
  }

  return client.service(service).get(serviceId)
}

export const initEngine = async (
  sceneId: string,
  initOptions: InitializeOptions,
  newSpawnPos?: ReturnType<typeof PortalComponent.get>,
  engineCallbacks?: EngineCallbacks
): Promise<any> => {
  const isOffline = !initOptions.networking
  let sceneData = await getSceneData(sceneId, isOffline)

  // 1. Initialize Engine if not initialized
  if (!Engine.isInitialized) {
    await initializeEngine(initOptions)
    document.dispatchEvent(new CustomEvent('ENGINE_LOADED')) // this is the only time we should use document events. would be good to replace this with react state

    if (typeof engineCallbacks?.onEngineInitialized === 'function') {
      engineCallbacks.onEngineInitialized()
    }
  }

  // 2. Connect to server
  if (!isOffline) await Store.store.dispatch(connectToInstanceServer('instance'))

  await new Promise<void>((resolve) => {
    EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, resolve)
  })

  if (typeof engineCallbacks?.onConnectedToServer === 'function') {
    engineCallbacks.onConnectedToServer()
  }

  // 3. Start scene loading
  Store.store.dispatch(setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))

  await WorldScene.load(sceneData, engineCallbacks?.onSceneLoadProgress)

  getPortalDetails(configs)
  Store.store.dispatch(setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  Store.store.dispatch(setAppLoaded(true))

  if (typeof engineCallbacks?.onConnectedToServer === 'function') {
    engineCallbacks.onConnectedToServer()
  }

  // 4. Joing to new world
  await new Promise<void>(async (resolve) => {
    // TEMPORARY - just so portals work for now - will be removed in favor of gameserver-gameserver communication
    let spawnTransform
    if (newSpawnPos) {
      spawnTransform = { position: newSpawnPos.spawnPosition, rotation: newSpawnPos.spawnRotation }
    }

    const { worldState } = await (Network.instance.transport as SocketWebRTCClientTransport).instanceRequest(
      MessageTypes.JoinWorld.toString(),
      { spawnTransform }
    )
    Network.instance.incomingMessageQueueReliable.add(worldState)
    resolve()
  })

  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })

  if (typeof engineCallbacks?.onJoinedToNewWorld === 'function') {
    engineCallbacks.onJoinedToNewWorld()
  }

  // 5. Dispatch success
  Store.store.dispatch(setAppOnBoardingStep(GeneralStateList.SUCCESS))

  if (typeof engineCallbacks?.onSuccess === 'function') {
    engineCallbacks.onSuccess()
  }
}

export const teleportToLocation = async (
  portalComponent: ReturnType<typeof PortalComponent.get>,
  slugifiedNameOfCurrentLocation: string,
  onTeleport: Function
) => {
  if (slugifiedNameOfCurrentLocation === portalComponent.location) {
    teleportPlayer(
      Network.instance.localClientEntity,
      portalComponent.remoteSpawnPosition,
      portalComponent.remoteSpawnRotation
    )
    return
  }

  // shut down connection with existing GS
  Store.store.dispatch(resetInstanceServer())
  Network.instance.transport.close()

  await teleportToScene(portalComponent, async () => {
    await processLocationChange(new Worker('/scripts/loadPhysXClassic.js'))

    onTeleport()
    Store.store.dispatch(getLocationByName(portalComponent.location))
  })
}
