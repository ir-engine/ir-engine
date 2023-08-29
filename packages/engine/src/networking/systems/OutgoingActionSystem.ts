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

import { PeerID, PeersUpdateType } from '@etherealengine/common/src/interfaces/PeerID'
import { Action, clearOutgoingActions, dispatchAction, getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { Network } from '../classes/Network'
import { WorldState } from '../interfaces/WorldState'
import { NetworkActions, NetworkState } from '../NetworkState'

/** Publish to connected peers that peer information has changed */
export const updatePeers = (network: Network) => {
  const userNames = getState(WorldState).userNames
  const peers = Object.values(network.peers).map((peer) => {
    return {
      peerID: peer.peerID,
      peerIndex: peer.peerIndex,
      userID: peer.userId,
      userIndex: peer.userIndex,
      name: userNames[peer.userId]
    }
  }) as Array<PeersUpdateType>
  dispatchAction(
    NetworkActions.updatePeers({
      peers,
      $topic: network.topic,
      $network: network.id
    })
  )
}

export const sendActionsAsPeer = (network: Network) => {
  if (!network.authenticated) return
  const actions = [...Engine.instance.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return
  for (const action of actions) {
    if (action.$network && !action.$topic && action.$network === network.id) action.$topic = network.topic
  }
  // for (const peerID of network.peers) {
  network.transport.messageToPeer(
    network.hostPeerID,
    /*encode(*/ actions //)
  )
  clearOutgoingActions(network.topic)
}

export const sendActionsAsHost = (network: Network) => {
  if (!network.authenticated) return

  const actions = [...Engine.instance.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return

  const outgoing = Engine.instance.store.actions.outgoing

  for (const peerID of Object.keys(network.peers) as PeerID[]) {
    const arr: Action[] = []
    for (const a of [...actions]) {
      const action = { ...a }
      if (action.$network) {
        if (action.$network !== network.id) continue
        else action.$topic = network.topic
      }
      if (outgoing[network.topic].historyUUIDs.has(action.$uuid)) {
        const idx = outgoing[network.topic].queue.findIndex((a) => a.$uuid === action.$uuid)
        outgoing[network.topic].queue.splice(idx, 1)
      }
      if (!action.$to) continue
      if (action.$to === 'all' || (action.$to === 'others' && peerID !== action.$peer) || action.$to === peerID) {
        arr.push(action)
      }
    }
    if (arr.length)
      network.transport.messageToPeer(
        peerID,
        /*encode(*/ arr //)
      )
  }

  // TODO: refactor this to support multiple connections of the same topic type
  clearOutgoingActions(network.topic)
}

export const sendOutgoingActions = () => {
  for (const network of Object.values(getState(NetworkState).networks)) {
    try {
      if (Engine.instance.userID === network.hostId) sendActionsAsHost(network as Network)
      else sendActionsAsPeer(network as Network)
    } catch (e) {
      console.error(e)
    }
  }
}

const execute = () => {
  sendOutgoingActions()
}

export const OutgoingActionSystem = defineSystem({
  uuid: 'ee.engine.OutgoingActionSystem',
  execute
})
