/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { updatePeers } from '@etherealengine/engine/src/networking/systems/OutgoingActionSystem'

import {
  MediaConsumerActions,
  MediaProducerActions
} from '@etherealengine/engine/src/networking/systems/MediaProducerConsumerState'
import { defineActionQueue } from '@etherealengine/hyperflux'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'
import { handleConsumerSetLayers, handleRequestConsumer, handleRequestProducer } from './WebRTCFunctions'

export async function validateNetworkObjects(network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of network.peers) {
    if (client.userId === Engine.instance.userID) continue
    if (Date.now() - client.lastSeenTs > 5000) {
      NetworkPeerFunctions.destroyPeer(network, peerID)
      updatePeers(network)
    }
  }
}

const requestConsumerActionQueue = defineActionQueue(MediaConsumerActions.requestConsumer.matches)
const consumerLayersActionQueue = defineActionQueue(MediaConsumerActions.consumerLayers.matches)
const requestProducerActionQueue = defineActionQueue(MediaProducerActions.requestProducer.matches)

const execute = () => {
  const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCServerNetwork
  if (mediaNetwork) {
    for (const action of requestConsumerActionQueue()) {
      handleRequestConsumer(mediaNetwork, action)
    }
    for (const action of consumerLayersActionQueue()) {
      handleConsumerSetLayers(mediaNetwork, action)
    }
    for (const action of requestProducerActionQueue()) {
      handleRequestProducer(mediaNetwork, action)
    }
  }

  const worldNetwork = Engine.instance.worldNetwork as SocketWebRTCServerNetwork
  if (worldNetwork) {
    if (worldNetwork.isHosting) validateNetworkObjects(worldNetwork)
  }
}

export const ServerHostNetworkSystem = defineSystem({
  uuid: 'ee.engine.ServerHostNetworkSystem',
  execute
})
