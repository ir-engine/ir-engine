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

import { Spark } from 'primus'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { DataChannelType } from '../classes/Network'
import { MediaTagType, PeerMediaType } from '../NetworkState'

export interface NetworkPeer {
  userId: UserId
  userIndex: number
  spectating?: boolean
  networkId?: NetworkId // to easily retrieve the network object correspending to this client
  // The following properties are only present on the server
  spark?: Spark
  peerIndex: number
  peerID: PeerID
  lastSeenTs?: any
  joinTs?: any
  media?: Record<MediaTagType, PeerMediaType>
  consumerLayers?: {}
  stats?: {}
  instanceSendTransport?: any
  instanceRecvTransport?: any
  channelSendTransport?: any
  channelRecvTransport?: any
  outgoingDataConsumers?: Map<DataChannelType, any> // Key of internal producer id => id of data producer
  incomingDataConsumers?: Map<DataChannelType, any> // Key of internal producer id => id of data producer
  dataProducers?: Map<string, any> // Keyof internal producer id => label of data channel
}

export interface UserClient {
  userId: UserId
  name: string
}
