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

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { addOutgoingTopicIfNecessary, Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { InstanceID } from '../../schemas/networking/instance.schema'
import { NetworkPeer } from '../interfaces/NetworkPeer'

/**
 * Network topics are classes of networks. Topics are used to disitinguish between multiple networks of the same type.
 */
export const NetworkTopics = {
  world: 'world' as Topic,
  media: 'media' as Topic
}

export interface TransportInterface {
  messageToPeer: (peerId: PeerID, data: any) => void
  messageToAll: (data: any) => void
  onMessage: (fromPeerID: PeerID, data: any) => void
  bufferToPeer: (dataChannelType: DataChannelType, fromPeerID: PeerID, peerId: PeerID, data: any) => void
  bufferToAll: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => void
  onBuffer: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => void
}

export interface JitterBufferEntry {
  simulationTime: number
  read: () => void
}

/** Interface for the Transport. */
export const createNetwork = <Ext>(
  id: InstanceID,
  hostId: UserID, // TODO make PeerID, derive user from UserID
  topic: Topic,
  transport = {
    messageToPeer: (peerId: PeerID, data: any) => {},
    messageToAll: (data: any) => {},
    onMessage: (fromPeerID: PeerID, data: any) => {},
    bufferToPeer: (dataChannelType: DataChannelType, fromPeerID: PeerID, peerId: PeerID, data: any) => {},
    bufferToAll: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => {},
    onBuffer: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => {}
  } as TransportInterface & Ext
) => {
  addOutgoingTopicIfNecessary(topic)
  const network = {
    /** Connected peers */
    peers: {} as Record<PeerID, NetworkPeer>,

    /** Map of numerical peer index to peer IDs */
    peerIndexToPeerID: {} as Record<number, PeerID>,

    /** Map of peer IDs to numerical peer index */
    peerIDToPeerIndex: {} as Record<PeerID, number>,

    /**
     * The index to increment when a new peer connects
     * NOTE: Must only be updated by the host
     * @todo - make this a function and throw an error if we are not the host
     */
    peerIndexCount: 0,

    /** Connected users */
    users: {} as Record<UserID, PeerID[]>,

    /** Map of numerical user index to user client IDs */
    userIndexToUserID: {} as Record<number, UserID>,

    /** Map of user client IDs to numerical user index */
    userIDToUserIndex: {} as Record<UserID, number>,

    /** Gets the host peer */
    get hostPeerID() {
      const hostPeers = network.users[network.id]
      if (!hostPeers) return undefined!
      return hostPeers[0]
    },

    /**
     * The index to increment when a new user joins
     * NOTE: Must only be updated by the host
     * @todo - make this a function and throw an error if we are not the host
     */
    userIndexCount: 0,

    /**
     * The UserID of the host
     * - will either be a user's UserID, or an instance server's InstanceId
     * @todo rename to hostUserID to differentiate better from hostPeerID
     * @todo change from UserID to PeerID and change "get hostPeerID()" to "get hostUserID()"
     */
    hostId,

    /**
     * The ID of this network, equivalent to the InstanceID of an instance
     */
    id,

    /**
     * The network socket connection is active
     */
    connected: false,

    /**
     * The network is authenticated
     */
    authenticated: false,

    /**
     * The network is ready for sending messages and data
     */
    ready: false,

    /**
     * The transport used by this network.
     */
    transport,

    /**
     * Check if this user is hosting the world.
     */
    get isHosting() {
      return Engine.instance.userID === network.hostId
    },

    topic
  }

  return network
}

export type Network = ReturnType<typeof createNetwork>
