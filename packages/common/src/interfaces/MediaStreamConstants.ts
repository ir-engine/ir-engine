import { ChannelType } from './Channel'

export type MediaStreamAppData = {
  mediaTag: MediaTagType
  peerId: string
  direction: TransportDirection
  channelType: ChannelType
  channelId: string
}

export type MediaTagType = 'cam-video' | 'cam-audio' | 'screen-video' | 'screen-audio'

export type TransportDirection = 'send' | 'receive'
