/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  NetworkID,
  PeerID,
  UserID,
  defineAction,
  defineState,
  getMutableState,
  getState,
  matches,
  matchesPeerID,
  none
} from '@ir-engine/hyperflux'

import { DataChannelType } from './DataChannelRegistry'
import { Network } from './Network'
import { matchesUserID } from './functions/matchesUserID'
import { SerializationSchema } from './serialization/Utils'

export type PeersUpdateType = {
  peerID: PeerID
  peerIndex: number
  userID: UserID
}

export type PeerTransport = {
  message?: (data: any) => void
  buffer?: (dataChannelType: DataChannelType, data: any) => void
  end?: () => void
}

export interface NetworkPeer {
  userId: UserID
  peerID: PeerID
  peerIndex: number
}

export class NetworkActions {
  static peerJoined = defineAction({
    type: 'ee.engine.network.PEER_JOINED',
    peerID: matchesPeerID,
    peerIndex: matches.number,
    userID: matchesUserID
  })

  static peerLeft = defineAction({
    type: 'ee.engine.network.PEER_LEFT',
    peerID: matchesPeerID,
    userID: matchesUserID
  })
}

export const NetworkState = defineState({
  name: 'NetworkState',
  initial: {
    hostIds: {
      media: null as NetworkID | null,
      world: null as NetworkID | null
    },
    // todo - move to Network.schemas
    networkSchema: {} as { [key: string]: SerializationSchema },
    networks: {} as { [key: NetworkID]: Network },
    config: {
      /** Allow connections to a world instance server */
      world: false,
      /** Allow connections to a media instance server */
      media: false,
      /** Allow connections to channel media instances and friend functionality */
      friends: false,
      /** Use instance IDs in url */
      instanceID: false,
      /** Use room IDs in url */
      roomID: false
    }
  },

  /** must be explicitly ordered as objects return keys in assignment order */
  get orderedNetworkSchema() {
    return Object.keys(getState(NetworkState).networkSchema)
      .sort()
      .map((key) => getState(NetworkState).networkSchema[key])
  },

  get worldNetwork() {
    const state = getState(NetworkState)
    return state.networks[state.hostIds.world!]!
  },

  get worldNetworkState() {
    return getMutableState(NetworkState).networks[getState(NetworkState).hostIds.world!]!
  },

  get mediaNetwork() {
    const state = getState(NetworkState)
    return state.networks[state.hostIds.media!]!
  },

  get mediaNetworkState() {
    return getMutableState(NetworkState).networks[getState(NetworkState).hostIds.media!]!
  }
})

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

export type PeerMediaType = {
  /** @deprecated - use ProducersConsumerState instead */
  paused: boolean
  /** @deprecated - use ProducersConsumerState instead */
  globalMute: boolean
  producerId: string
  encodings: Array<{
    mimeType: 'video/rtx' | 'video/vp8' | 'video/h264' | 'video/vp9' | 'audio/opus' | 'audio/pcmu' | 'audio/pcma'
    payloadType: number
    clockRate: number
    parameters: any
    rtcpFeedback: any[]
  }>
}

export const SceneUser = 'scene' as UserID
export const ScenePeer = 'scene' as PeerID

export const addNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.id].set(network)
}

export const removeNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.id].set(none)
}
