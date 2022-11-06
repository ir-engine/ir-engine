import { ChannelType } from './Channel'
import { PeerID } from './PeerID'

export type MediaStreamAppData = {
  mediaTag: MediaTagType
  peerId: PeerID
  direction: TransportDirection
  channelType: ChannelType
  channelId: string
}

export type MediaTagType = 'cam-video' | 'cam-audio' | 'screen-video' | 'screen-audio'

export type TransportDirection = 'send' | 'receive'
