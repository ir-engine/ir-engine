import { Spark } from 'primus'

import { MediaTagType } from '@etherealengine/common/src/interfaces/MediaStreamConstants'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

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
  media?: Record<MediaTagType, any>
  consumerLayers?: {}
  stats?: {}
  instanceSendTransport?: any
  instanceRecvTransport?: any
  channelSendTransport?: any
  channelRecvTransport?: any
  dataConsumers?: Map<string, any> // Key => id of data producer
  dataProducers?: Map<string, any> // Key => label of data channel}
}

export interface UserClient {
  userId: UserId
  name: string
}
