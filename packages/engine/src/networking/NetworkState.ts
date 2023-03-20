import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineState, getMutableState, getState, none } from '@etherealengine/hyperflux'

import { DataChannelType, Network } from './classes/Network'
import { SerializationSchema } from './serialization/Utils'

type RegistryFunction = (network: Network, dataChannel: DataChannelType, fromPeerID: PeerID, message: any) => void

export const NetworkState = defineState({
  name: 'NetworkState',
  initial: {
    hostIds: {
      media: null as UserId | null,
      world: null as UserId | null
    },
    // todo - move to Network.schemas
    networkSchema: {} as { [key: string]: SerializationSchema },
    networks: {} as { [key: UserId]: Network }
  }
})

export const dataChannelRegistry = new Map<DataChannelType, RegistryFunction[]>()

export const webcamVideoDataChannelType = 'ee.core.webcamVideo.dataChannel' as DataChannelType
export const webcamAudioDataChannelType = 'ee.core.webcamAudio.dataChannel' as DataChannelType
export const screenshareVideoDataChannelType = 'ee.core.screenshareVideo.dataChannel' as DataChannelType
export const screenshareAudioDataChannelType = 'ee.core.screenshareAudio.dataChannel' as DataChannelType

export const addNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.hostId].set(network)
}

export const removeNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.hostId].set(none)
}

export const addDataChannelHandler = (dataChannelType: DataChannelType, handler: RegistryFunction) => {
  if (!dataChannelRegistry.has(dataChannelType)) {
    dataChannelRegistry.set(dataChannelType, [])
  }
  dataChannelRegistry.get(dataChannelType)!.push(handler)
}

export const removeDataChannelHandler = (dataChannelType: DataChannelType, handler: RegistryFunction) => {
  if (!dataChannelRegistry.has(dataChannelType)) return

  const index = dataChannelRegistry.get(dataChannelType)!.indexOf(handler)
  if (index === -1) return

  dataChannelRegistry.get(dataChannelType)!.splice(index, 1)

  if (dataChannelRegistry.get(dataChannelType)!.length === 0) {
    dataChannelRegistry.delete(dataChannelType)
  }
}

export const updateNetworkID = (network: Network, newHostId: UserId) => {
  const state = getMutableState(NetworkState)
  state.networks[network.hostId].set(none)
  state.networks[newHostId].set(network)
  state.networks[newHostId].hostId.set(newHostId)
}
