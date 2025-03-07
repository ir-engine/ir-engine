/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Action,
  addOutgoingTopicIfNecessary,
  clearOutgoingActions,
  dispatchAction,
  getState,
  HyperFlux,
  PeerID
} from '@ir-engine/hyperflux'

import { Network } from '../Network'
import { NetworkState } from '../NetworkState'

const receiveIncomingActions = (network: Network, fromPeerID: PeerID, actions: Required<Action>[]) => {
  if (network.isHosting) {
    for (const a of actions) {
      a.$network = network.id
      dispatchAction(a)
    }
  } else {
    for (const a of actions) {
      HyperFlux.store.actions.incoming.push(a)
    }
  }
}

const sendActionsAsPeer = (network: Network) => {
  const outgoing = HyperFlux.store.actions.outgoing[network.topic]
  if (!outgoing?.queue?.length) return
  const actions = [] as Action[]
  for (const action of outgoing.queue) {
    if (action.$network && !action.$topic && action.$network === network.id) action.$topic = network.topic
    if (action.$to === HyperFlux.store.peerID) continue
    actions.push(action)
  }
  // in unhosted networks, we send to all peers
  if (!network.hostPeerID) {
    const actionsByTo = actions.reduce(
      (acc, action) => {
        if (!action.$to) return acc
        const toPeers = Array.isArray(action.$to) ? action.$to : [action.$to]
        for (const toPeer of toPeers) {
          if (!acc[toPeer]) acc[toPeer] = []
          acc[toPeer].push(action)
        }
        return acc
      },
      {} as Record<PeerID | 'all', Action[]>
    )

    for (const [peerID, actions] of Object.entries(actionsByTo)) {
      if (peerID === 'all') {
        for (const peerID of Object.keys(network.peers) as PeerID[]) {
          network.messageToPeer(peerID, actions)
        }
      } else {
        network.messageToPeer(peerID as PeerID, actions)
      }
    }
  } else {
    network.messageToPeer(network.hostPeerID!, actions)
  }
  clearOutgoingActions(network.topic)
}

const sendActionsAsHost = (network: Network) => {
  addOutgoingTopicIfNecessary(network.topic)

  const actions = [...HyperFlux.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return

  for (const peerID of Object.keys(network.peers) as PeerID[]) {
    const arr: Action[] = []
    for (const a of [...actions]) {
      const action = { ...a }
      if (action.$network) {
        if (action.$network !== network.id) continue
        else action.$topic = network.topic
      }
      if (!action.$to) continue
      if (action.$to === 'all' || action.$to === peerID) {
        arr.push(action)
      }
    }
    if (arr.length)
      network.messageToPeer(
        peerID,
        /*encode(*/ arr //)
      )
  }

  // TODO: refactor this to support multiple connections of the same topic type
  clearOutgoingActions(network.topic)
}

const sendOutgoingActions = () => {
  for (const network of Object.values(getState(NetworkState).networks)) {
    try {
      if (HyperFlux.store.peerID === network.hostPeerID) sendActionsAsHost(network as Network)
      else sendActionsAsPeer(network as Network)
    } catch (e) {
      console.error(e)
    }
  }
}

export const NetworkActionFunctions = {
  sendActionsAsPeer,
  sendActionsAsHost,
  sendOutgoingActions,
  receiveIncomingActions
}
