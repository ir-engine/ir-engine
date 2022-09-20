import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { validateNetworkObjects } from '../functions/validateNetworkObjects'
import { createDataReader } from '../serialization/DataReader'

export const applyUnreliableQueueFast = (deserialize: Function) => (world: World) => {
  if (!world.worldNetwork) return

  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = world.worldNetwork

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    // we may need producer IDs at some point, likely for p2p netcode, for now just consume it
    incomingMessageQueueUnreliableIDs.pop()
    const packet = incomingMessageQueueUnreliable.pop()

    deserialize(world, world.worldNetwork, packet)
  }
}

export default async function IncomingNetworkSystem(world: World) {
  const deserialize = createDataReader()
  const applyIncomingNetworkState = applyUnreliableQueueFast(deserialize)

  const VALIDATE_NETWORK_INTERVAL = Engine.instance.tickRate * 5

  const engineState = getEngineState()

  const execute = () => {
    if (!engineState.isEngineInitialized.value) return
    applyIncomingNetworkState(world)
    if (world.worldNetwork?.isHosting && world.fixedTick % VALIDATE_NETWORK_INTERVAL === 0)
      validateNetworkObjects(world, world.worldNetwork)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
