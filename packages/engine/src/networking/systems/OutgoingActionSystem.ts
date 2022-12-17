import { Action, clearOutgoingActions } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { Network } from '../classes/Network'
import { MessageTypes } from '../enums/MessageTypes'

export const sendActionsAsPeer = (network: Network) => {
  if (!network.ready) return
  const actions = [...Engine.instance.store.actions.outgoing[network.topic].queue]
  for (const [socketID, socket] of network.sockets) {
    if (actions.length && socket) {
      socket.emit(MessageTypes.ActionData.toString(), /*encode(*/ actions) //)
      clearOutgoingActions(network.topic)
    }
  }
}

export const sendActionsAsHost = (network: Network) => {
  if (!network.ready) return

  const actions = [...Engine.instance.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return

  const outgoing = Engine.instance.store.actions.outgoing

  for (const [socketID, socket] of network.sockets) {
    const arr: Action[] = []
    for (const a of [...actions]) {
      const action = { ...a }
      if (outgoing[network.topic].historyUUIDs.has(action.$uuid)) {
        const idx = outgoing[network.topic].queue.indexOf(action)
        outgoing[network.topic].queue.splice(idx, 1)
      }
      if (!action.$to) continue
      const toUserId = network.peers.get(socketID)?.userId
      if (action.$to === 'all' || (action.$to === 'others' && toUserId !== action.$from) || action.$to === toUserId) {
        arr.push(action)
      }
    }
    if (arr.length) socket.emit(MessageTypes.ActionData.toString(), /*encode(*/ arr) //)
  }

  // TODO: refactor this to support multiple connections of the same topic type
  clearOutgoingActions(network.topic, Engine.instance.store)
}

const sendOutgoingActions = (world: World) => {
  for (const [instanceId, network] of Object.entries(world.networks.value)) {
    try {
      if (network.hostId === Engine.instance.userId) sendActionsAsHost(network)
      else sendActionsAsPeer(network)
    } catch (e) {
      console.error(e)
    }
  }
}

export default function OutgoingActionSystem(world: World) {
  const execute = () => {
    sendOutgoingActions(world)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
