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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Action,
  HyperFlux,
  NetworkID,
  PeerID,
  Topic,
  UserID,
  defineState,
  getMutableState,
  getState,
  none
} from '@ir-engine/hyperflux'

import { DataChannelRegistryState, DataChannelType } from '../media/DataChannelRegistry'
import { NetworkActionFunctions } from './NetworkActionFunctions'
import { NetworkPeerState } from './NetworkPeerState'

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

export const NetworkState = defineState({
  name: 'NetworkState',
  initial: {
    hostIds: {
      media: null as NetworkID | null,
      world: null as NetworkID | null
    },
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

export const SceneUser = 'scene' as UserID
export const ScenePeer = 'scene' as PeerID

/**
 * Network topics are classes of networks. Topics are used to disitinguish between multiple networks of the same type.
 */
export const NetworkTopics = {
  world: 'world' as Topic,
  media: 'media' as Topic
}

export type Network<Ext = unknown> = {
  transports: Record<PeerID, PeerTransport>
  /**
   * Connected peers
   * @deprecated use `getState(NetworkPeerState)[network.id].peers` instead
   */
  peers: Record<PeerID, NetworkPeer>

  /**
   * Map of numerical peer index to peer IDs
   * @deprecated use `getState(NetworkPeerState)[network.id].peerIndexToPeerID` instead
   */
  peerIndexToPeerID: Record<number, PeerID>

  /**
   * Map of peer IDs to numerical peer index
   * @deprecated use `getState(NetworkPeerState)[network.id].peerIDToPeerIndex` instead
   */
  peerIDToPeerIndex: Record<PeerID, number>

  /**
   * Connected users
   * @deprecated use `getState(NetworkPeerState)[network.id].users` instead
   */
  users: Record<UserID, PeerID[]>

  /**
   * The UserID of the host
   * - will either be a user's UserID, or an instance server's InstanceId
   * @todo rename to hostUserID to differentiate better from hostPeerID
   * @todo change from UserID to PeerID and change "get hostPeerID()" to "get hostUserID()"
   */
  hostPeerID: PeerID | null

  readonly hostUserID: UserID | null

  /**
   * The ID of this network, equivalent to the InstanceID of an instance
   */
  id: NetworkID

  /**
   * The network is ready for sending messages and data
   */
  ready: boolean

  /**
   * The transport used by this network.
   */
  messageToPeer: (peerId: PeerID, data: any) => void
  messageToAll: (data: any) => void
  onMessage: (fromPeerID: PeerID, data: any) => void
  bufferToPeer: (dataChannelType: DataChannelType, fromPeerID: PeerID, peerId: PeerID, data: any) => void
  bufferToAll: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => void
  onBuffer: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => void

  readonly isHosting: boolean

  topic: Topic
} & Ext

export const joinNetwork = <Ext = unknown>(
  id: NetworkID,
  hostPeerID: PeerID | null,
  topic: Topic,
  extension?: Ext
): Network<Ext> => {
  const network = {
    messageToPeer: (peerId: PeerID, data: any) => {
      network.transports[peerId]?.message?.(data)
    },
    messageToAll: (data: any) => {
      for (const peer of Object.values(network.peers)) network.messageToPeer(peer.peerID, data)
    },
    onMessage: (fromPeerID: PeerID, message: any) => {
      const actions = message as any as Required<Action>[]
      // const actions = decode(new Uint8Array(message)) as IncomingActionType[]
      NetworkActionFunctions.receiveIncomingActions(network, fromPeerID, actions)
    },
    bufferToPeer: (dataChannelType: DataChannelType, fromPeerID: PeerID, peerID: PeerID, data: any) => {
      network.transports[peerID]?.buffer?.(dataChannelType, data)
    },
    bufferToAll: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => {
      for (const peer of Object.values(network.peers))
        network.bufferToPeer(dataChannelType, fromPeerID, peer.peerID, data)
    },
    onBuffer: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => {
      const dataChannelFunctions = getState(DataChannelRegistryState)[dataChannelType]
      if (dataChannelFunctions) {
        for (const func of dataChannelFunctions) func(network, dataChannelType, fromPeerID, data)
      }
    },
    ...extension,
    transports: {},
    get peers() {
      return getState(NetworkPeerState)[id]?.peers
    },
    get peerIndexToPeerID() {
      return getState(NetworkPeerState)[id]?.peerIndexToPeerID
    },
    get peerIDToPeerIndex() {
      return getState(NetworkPeerState)[id]?.peerIDToPeerIndex
    },
    get users() {
      return getState(NetworkPeerState)[id]?.users
    },
    hostPeerID,
    get hostUserID() {
      return network.hostPeerID && (network.peers[network.hostPeerID]?.userId as UserID | undefined)
    },
    id,
    ready: false,
    get isHosting() {
      return HyperFlux.store.peerID === network.hostPeerID
    },
    topic
  } as Network<Ext>

  getMutableState(NetworkState).networks[network.id].set(network)

  return network
}

export const leaveNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.id].set(none)
}
