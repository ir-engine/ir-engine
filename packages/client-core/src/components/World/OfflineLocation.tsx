import React, { useEffect } from 'react'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { PeerID } from '@xrengine/common/src/interfaces/PeerID'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Network, NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@xrengine/engine/src/networking/functions/NetworkPeerFunctions'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { addOutgoingTopicIfNecessary, useState } from '@xrengine/hyperflux'

import InstanceServerWarnings from './InstanceServerWarnings'

export const OfflineLocation = () => {
  const engineState = useState(getEngineState())
  const authState = useAuthState()

  /** OFFLINE */
  useEffect(() => {
    if (engineState.sceneLoaded.value) {
      const world = Engine.instance.currentWorld
      const userId = Engine.instance.userId
      const userIndex = 1
      const peerID = 'peerID' as PeerID
      const peerIndex = 1

      world.hostIds.world.set(userId)
      world.networks.set(userId, new Network(userId, NetworkTopics.world))
      addOutgoingTopicIfNecessary(NetworkTopics.world)

      NetworkPeerFunctions.createPeer(
        world.worldNetwork,
        peerID,
        peerIndex,
        userId,
        userIndex,
        authState.user.name.value,
        world
      )

      receiveJoinWorld({
        highResTimeOrigin: performance.timeOrigin,
        worldStartTime: performance.now(),
        cachedActions: [],
        peerIndex,
        peerID,
        routerRtpCapabilities: undefined
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  return <InstanceServerWarnings />
}
