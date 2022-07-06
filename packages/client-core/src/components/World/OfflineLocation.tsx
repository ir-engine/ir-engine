import React from 'react'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Network, NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '@xrengine/engine/src/networking/functions/WorldNetworkActionReceptor'
import { useHookEffect, useState } from '@xrengine/hyperflux'

import InstanceServerWarnings from './InstanceServerWarnings'

export const OfflineLocation = () => {
  const engineState = useState(getEngineState())
  const authState = useAuthState()

  /** OFFLINE */
  useHookEffect(async () => {
    if (engineState.sceneLoaded.value) {
      const world = Engine.instance.currentWorld
      const userId = Engine.instance.userId

      world._worldHostId = userId
      world.networks.set(userId, new Network(userId, NetworkTopics.world))

      const index = 1
      WorldNetworkActionReceptor.receiveCreatePeers(
        WorldNetworkAction.createPeer({
          index: index,
          name: authState.user.name.value,
          $topic: NetworkTopics.world
        })
      )

      receiveJoinWorld({
        highResTimeOrigin: performance.timeOrigin,
        worldStartTime: performance.now(),
        client: {
          index: 1,
          name: authState.user.name.value
        },
        cachedActions: []
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  return <InstanceServerWarnings />
}

export default OfflineLocation
