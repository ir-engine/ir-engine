import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineState, getMutableState, none } from '@etherealengine/hyperflux'

import { DataChannelType, Network } from './classes/Network'
import { SerializationSchema } from './serialization/Utils'

type RegistryFunction = (network: Network, fromPeerID: PeerID, message: any) => void

export const NetworkState = defineState({
  name: 'NetworkState',
  initial: {
    hostIds: {
      media: null as UserId | null,
      world: null as UserId | null
    },
    // todo - move to SerializationState.schemas
    networkSchema: {} as { [key: string]: SerializationSchema },
    networks: {} as { [key: UserId]: Network },
    dataChannelRegistry: {} as {
      [key: DataChannelType]: RegistryFunction[]
    }
  }
})

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
  const state = getMutableState(NetworkState)
  if (!state.dataChannelRegistry[dataChannelType]) {
    state.dataChannelRegistry[dataChannelType].set([])
  }
  state.dataChannelRegistry[dataChannelType].merge([handler])
}

export const removeDataChannelHandler = (dataChannelType: DataChannelType, handler: RegistryFunction) => {
  const state = getMutableState(NetworkState)
  const index = state.dataChannelRegistry[dataChannelType].value.indexOf(handler)
  if (index === -1) return
  state.dataChannelRegistry[dataChannelType][index].set(none)
  if (!state.dataChannelRegistry[dataChannelType].length) return
  state.dataChannelRegistry[dataChannelType].set(none)
}

export const updateNetworkID = (network: Network, newHostId: UserId) => {
  const state = getMutableState(NetworkState)
  state.networks[network.hostId].set(none)
  state.networks[newHostId].set(network)
  state.networks[newHostId].hostId.set(newHostId)
}
