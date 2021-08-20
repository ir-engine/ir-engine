import { CHANNEL_TYPE_CHANGED } from '../actions'

export type ChannelTypeAction = { channelType: string; channelId: string }

export const setChannelTypeState = (channelType: string, channelId: string) => ({
  type: CHANNEL_TYPE_CHANGED,
  channelType,
  channelId
})
