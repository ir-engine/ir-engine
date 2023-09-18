import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Action, clearOutgoingActions, dispatchAction, getState } from '@etherealengine/hyperflux'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkState } from '../NetworkState'
import { Network } from '../classes/Network'

const receiveIncomingActions = (network: Network, fromPeerID: PeerID, actions: Required<Action>[]) => {
  if (network.isHosting) {
    const networkPeer = network.peers[fromPeerID]
    for (const a of actions) {
      a.$from = networkPeer.userId
      a.$network = network.id
      dispatchAction(a)
    }
  } else {
    for (const a of actions) {
      Engine.instance.store.actions.incoming.push(a)
    }
  }
}

const sendActionsAsPeer = (network: Network) => {
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

const sendActionsAsHost = (network: Network) => {
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

const sendOutgoingActions = () => {
  for (const network of Object.values(getState(NetworkState).networks)) {
    try {
      if (Engine.instance.userID === network.hostId) sendActionsAsHost(network as Network)
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
