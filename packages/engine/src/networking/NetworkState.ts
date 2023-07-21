/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { ChannelType } from '@etherealengine/common/src/interfaces/Channel'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineState, getMutableState, none } from '@etherealengine/hyperflux'

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
    networks: {} as { [key: UserId]: Network },
    config: {
      /** Allow connections to a world instance server */
      world: false,
      /** Allow connections to a media instance server */
      media: false,
      /** Allow connections to party media instances and friend functionality */
      friends: false,
      /** Use instance IDs in url */
      instanceID: false,
      /** Use room IDs in url */
      roomID: false
    }
  }
})

export const dataChannelRegistry = new Map<DataChannelType, RegistryFunction[]>()

export const webcamVideoDataChannelType = 'ee.core.webcamVideo.dataChannel' as DataChannelType
export const webcamAudioDataChannelType = 'ee.core.webcamAudio.dataChannel' as DataChannelType
export const screenshareVideoDataChannelType = 'ee.core.screenshareVideo.dataChannel' as DataChannelType
export const screenshareAudioDataChannelType = 'ee.core.screenshareAudio.dataChannel' as DataChannelType

export type MediaTagType =
  | typeof webcamVideoDataChannelType
  | typeof webcamAudioDataChannelType
  | typeof screenshareVideoDataChannelType
  | typeof screenshareAudioDataChannelType

// export const webcamMediaType = 'webcam'
// export const screenshareMediaType = 'screenshare'

// export type MediaType = typeof webcamMediaType | typeof screenshareMediaType

export type MediaStreamAppData = {
  mediaTag: MediaTagType
  peerID: PeerID
  direction: TransportDirection
  channelType: ChannelType
  channelId: string
  clientDirection?: 'recv' | 'send'
}

export type PeerMediaType = {
  paused: boolean
  producerId: string
  globalMute: boolean
  encodings: Array<{
    mimeType: 'video/rtx' | 'video/vp8' | 'video/h264' | 'video/vp9' | 'audio/opus' | 'audio/pcmu' | 'audio/pcma'
    payloadType: number
    clockRate: number
    parameters: any
    rtcpFeedback: any[]
  }>
  channelType: ChannelType
  channelId: string
}

export type TransportDirection = 'send' | 'receive'

export const addNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.hostId].set(network)
}

export const updateNetwork = (network: Network) => {
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
