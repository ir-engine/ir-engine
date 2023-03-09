import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineState, getMutableState, none } from '@etherealengine/hyperflux'

import { Network } from './classes/Network'
import { SerializationSchema } from './serialization/Utils'

export const NetworkState = defineState({
  name: 'NetworkState',
  initial: {
    hostIds: {
      media: null as UserId | null,
      world: null as UserId | null
    },
    networkSchema: {} as { [key: string]: SerializationSchema },
    networks: {} as { [key: UserId]: Network }
  }
})

export const addNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.hostId].set(network)
}

export const removeNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.hostId].set(none)
}

export const updateNetworkID = (network: Network, newHostId: UserId) => {
  const state = getMutableState(NetworkState)
  state.networks[network.hostId].set(none)
  state.networks[newHostId].set(network)
  state.networks[newHostId].hostId.set(newHostId)
}
