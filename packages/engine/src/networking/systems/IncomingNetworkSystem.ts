import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { DataChannelType, Network } from '../classes/Network'
import { NetworkState } from '../NetworkState'
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

const toArrayBuffer = (buf) => {
  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export const poseDataChannelType = 'pose' as DataChannelType

export default async function IncomingNetworkSystem() {
  const deserialize = createDataReader()
  const applyIncomingNetworkState = applyUnreliableQueueFast(deserialize)

  const networkState = getMutableState(NetworkState)

  networkState.dataChannelRegistry.merge({
    [poseDataChannelType]: (network: Network, fromPeerID: PeerID, message: any) => {
      if (network.isHosting) {
        network.incomingMessageQueueUnreliable.add(toArrayBuffer(message))
        network.incomingMessageQueueUnreliableIDs.add(fromPeerID)
        // forward data to clients in world immediately
        // TODO: need to include the userId (or index), so consumers can validate
        network.transport.bufferToAll(poseDataChannelType, message)
      } else {
        network.incomingMessageQueueUnreliable.add(message)
        network.incomingMessageQueueUnreliableIDs.add(fromPeerID) // todo, assume it
      }
    }
  })

  const engineState = getEngineState()

  const execute = () => {
    if (!engineState.isEngineInitialized.value) return
    applyIncomingNetworkState()
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
