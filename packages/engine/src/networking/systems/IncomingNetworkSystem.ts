import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { Network } from '../classes/Network'
import { validateNetworkObjects } from '../functions/validateNetworkObjects'
import { createDataReader } from '../serialization/DataReader'

export const applyUnreliableQueueFast = (deserialize: Function) => () => {
  const network = Engine.instance.worldNetwork
  if (!network) return

  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = network

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    // we may need producer IDs at some point, likely for p2p netcode, for now just consume it
    incomingMessageQueueUnreliableIDs.pop()
    const packet = incomingMessageQueueUnreliable.pop()

    deserialize(network, packet)
  }
}

export default async function IncomingNetworkSystem() {
  const deserialize = createDataReader()
  const applyIncomingNetworkState = applyUnreliableQueueFast(deserialize)

  const VALIDATE_NETWORK_INTERVAL = Engine.instance.tickRate * 5

  const engineState = getEngineState()

  const execute = () => {
    if (!engineState.isEngineInitialized.value) return
    applyIncomingNetworkState()
    if (Engine.instance.worldNetwork?.isHosting && Engine.instance.fixedTick % VALIDATE_NETWORK_INTERVAL === 0)
      validateNetworkObjects(Engine.instance.worldNetwork as Network)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
