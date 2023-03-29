import { PeersUpdateType } from '@etherealengine/common/src/interfaces/PeerID'
import { Action, clearOutgoingActions, getMutableState, getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Network } from '../classes/Network'
import { MessageTypes } from '../enums/MessageTypes'
import { WorldState } from '../interfaces/WorldState'
import { NetworkState } from '../NetworkState'

/** Publish to connected peers that peer information has changed */
export const updatePeers = (network: Network) => {
  const userNames = getMutableState(WorldState).userNames
  const peers = Array.from(network.peers.values()).map((peer) => {
    return {
      peerID: peer.peerID,
      peerIndex: peer.peerIndex,
      userID: peer.userId,
      userIndex: peer.userIndex,
      name: userNames[peer.userId].value
    }
  }) as Array<PeersUpdateType>
  for (const peerID of network.transport.peers)
    network.transport.messageToPeer(peerID, { type: MessageTypes.UpdatePeers.toString(), data: peers })
}

export const sendActionsAsPeer = (network: Network) => {
  if (!network.ready) return
  const actions = [...Engine.instance.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return
  for (const peerID of network.transport.peers) {
    network.transport.messageToPeer(network.hostPeerID, {
      type: MessageTypes.ActionData.toString(),
      /*encode(*/ data: actions
    }) //)
  }
  clearOutgoingActions(network.topic)
}

export const sendActionsAsHost = (network: Network) => {
  if (!network.ready) return

  const actions = [...Engine.instance.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return

  const outgoing = Engine.instance.store.actions.outgoing

  for (const peerID of network.transport.peers) {
    const arr: Action[] = []
    for (const a of [...actions]) {
      const action = { ...a }
      if (outgoing[network.topic].historyUUIDs.has(action.$uuid)) {
        const idx = outgoing[network.topic].queue.indexOf(action)
        outgoing[network.topic].queue.splice(idx, 1)
      }
      if (!action.$to) continue
      const toUserId = network.peers.get(peerID)?.userId
      if (action.$to === 'all' || (action.$to === 'others' && toUserId !== action.$from) || action.$to === toUserId) {
        arr.push(action)
      }
    }
    if (arr.length)
      network.transport.messageToPeer(peerID, { type: MessageTypes.ActionData.toString(), /*encode(*/ data: arr }) //)
  }

  // TODO: refactor this to support multiple connections of the same topic type
  clearOutgoingActions(network.topic, Engine.instance.store)
}

export const sendOutgoingActions = () => {
  for (const network of Object.values(getState(NetworkState).networks)) {
    try {
      if (Engine.instance.userId === network.hostId) sendActionsAsHost(network as Network)
      else sendActionsAsPeer(network as Network)
    } catch (e) {
      console.error(e)
    }
  }
}

export default function OutgoingActionSystem() {
  const execute = () => {
    sendOutgoingActions()
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
