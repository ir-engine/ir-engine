import React, { useEffect } from 'react'

import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { Network, NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { receiveJoinWorld } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { addNetwork, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { addOutgoingTopicIfNecessary, getMutableState, useState } from '@etherealengine/hyperflux'

import InstanceServerWarnings from './InstanceServerWarnings'

export const OfflineLocation = () => {
  const engineState = useState(getEngineState())
  const authState = useAuthState()

  /** OFFLINE */
  useEffect(() => {
    if (engineState.sceneLoaded.value) {
      const userId = Engine.instance.userId
      const userIndex = 1
      const peerID = 'peerID' as PeerID
      const peerIndex = 1

      const networkState = getMutableState(NetworkState)
      networkState.hostIds.world.set(userId)
      addNetwork(new Network(userId, NetworkTopics.world))
      addOutgoingTopicIfNecessary(NetworkTopics.world)

      NetworkPeerFunctions.createPeer(
        Engine.instance.worldNetwork as Network,
        peerID,
        peerIndex,
        userId,
        userIndex,
        authState.user.name.value
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
