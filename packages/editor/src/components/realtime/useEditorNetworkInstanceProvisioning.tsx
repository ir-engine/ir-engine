import { MathUtils } from 'three'

import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { dispatchAction, useHookEffect } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

export type SpectateWorldProps = {
  highResTimeOrigin: number
  worldStartTime: number
  client: { name: string; index: number }
  cachedActions: Required<Action>[]
}

const receiveSpectateWorld = (props: SpectateWorldProps) => {
  const { highResTimeOrigin, worldStartTime, client, cachedActions } = props
  console.log('RECEIVED SPECTATE WORLD RESPONSE', highResTimeOrigin, worldStartTime, client, cachedActions)
  const world = Engine.instance.currentWorld

  for (const action of cachedActions)
    Engine.instance.store.actions.incoming.push({ ...action, $fromCache: true, $uuid: MathUtils.generateUUID() })

  dispatchAction(WorldNetworkAction.createClient(client), [world.worldNetwork.hostId])
}

export const useEditorNetworkInstanceProvisioning = () => {
  const engineState = useEngineState()

  const worldNetworkHostId = Engine.instance.currentWorld.worldNetwork?.hostId
  const instanceConnectionState = useLocationInstanceConnectionState()
  const currentLocationInstanceConnection = instanceConnectionState.instances[worldNetworkHostId!].ornull

  useHookEffect(() => {
    if (
      engineState.isEngineInitialized.value &&
      currentLocationInstanceConnection?.value &&
      !currentLocationInstanceConnection.connected.value &&
      currentLocationInstanceConnection.provisioned.value &&
      !currentLocationInstanceConnection.connecting.value
    )
      LocationInstanceConnectionService.connectToServer(worldNetworkHostId)
  }, [
    engineState.isEngineInitialized,
    currentLocationInstanceConnection?.connected,
    currentLocationInstanceConnection?.connecting,
    currentLocationInstanceConnection?.provisioned
  ])

  useHookEffect(() => {
    const transportRequestData = {}
    if (engineState.connectedWorld.value && engineState.sceneLoaded.value) {
      Engine.instance.currentWorld.worldNetwork
        .request(MessageTypes.SpectateWorld.toString(), transportRequestData)
        .then(receiveSpectateWorld)
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])
}
