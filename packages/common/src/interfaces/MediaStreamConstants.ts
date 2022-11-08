import { ChannelType } from './Channel'
import { PeerID } from './PeerID'

export type MediaStreamAppData = {
  mediaTag: MediaTagType
  peerID: PeerID
  direction: TransportDirection
  channelType: ChannelType
  channelId: string
  clientDirection?: 'recv' | 'send'
}

export type MediaTagType = 'cam-video' | 'cam-audio' | 'screen-video' | 'screen-audio'

export type TransportDirection = 'send' | 'receive'
