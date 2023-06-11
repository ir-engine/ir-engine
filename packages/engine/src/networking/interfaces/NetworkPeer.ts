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
