import React from 'react'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Network, NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@xrengine/engine/src/networking/functions/NetworkPeerFunctions'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { useHookEffect, useState } from '@xrengine/hyperflux'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import InstanceServerWarnings from './InstanceServerWarnings'

export const OfflineLocation = () => {
  const engineState = useState(getEngineState())
  const authState = useAuthState()

  /** OFFLINE */
  useHookEffect(() => {
    if (engineState.sceneLoaded.value) {
      const world = Engine.instance.currentWorld
      const userId = Engine.instance.userId

      world._worldHostId = userId
      world.networks.set(userId, new Network(userId, NetworkTopics.world))
      ActionFunctions.addOutgoingTopicIfNecessary(NetworkTopics.world)

      const index = 1
      NetworkPeerFunctions.createPeer(world.worldNetwork, userId, index, authState.user.name.value, world)

      receiveJoinWorld({
        highResTimeOrigin: performance.timeOrigin,
        worldStartTime: performance.now(),
        cachedActions: []
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  return <InstanceServerWarnings />
}
