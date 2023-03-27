import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { getMutableState, none } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { DataChannelType, Network } from '../classes/Network'
import { addDataChannelHandler, NetworkState, removeDataChannelHandler } from '../NetworkState'
import { createDataReader } from '../serialization/DataReader'

export const applyUnreliableQueueFast = (deserialize: any) => () => {
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

const toArrayBuffer = (buf) => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export const ecsDataChannelType = 'ee.core.ecs.dataChannel' as DataChannelType

export default async function IncomingNetworkSystem() {
  const deserialize = createDataReader()
  const applyIncomingNetworkState = applyUnreliableQueueFast(deserialize)

  const handleNetworkdata = (
    network: Network,
    dataChannel: DataChannelType,
    fromPeerID: PeerID,
    message: ArrayBufferLike
  ) => {
    if (network.isHosting) {
      network.incomingMessageQueueUnreliable.add(toArrayBuffer(message))
      network.incomingMessageQueueUnreliableIDs.add(fromPeerID)
      // forward data to clients in world immediately
      // TODO: need to include the userId (or index), so consumers can validate
      network.transport.bufferToAll(ecsDataChannelType, message)
    } else {
      network.incomingMessageQueueUnreliable.add(message)
      network.incomingMessageQueueUnreliableIDs.add(fromPeerID) // todo, assume it
    }
  }

  addDataChannelHandler(ecsDataChannelType, handleNetworkdata)

  const engineState = getEngineState()

  const execute = () => {
    if (!engineState.isEngineInitialized.value) return
    applyIncomingNetworkState()
  }

  const cleanup = async () => {
    removeDataChannelHandler(ecsDataChannelType, handleNetworkdata)
  }

  return { execute, cleanup }
}
