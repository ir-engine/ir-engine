import {
  CHANNEL_TYPE_CHANGED,
  Action
} from '../actions';

export type ChannelTypeAction = { channelType: string, channelId: string };

export const setChannelTypeState = (channelType: string, channelId: string): Action => ({ type: CHANNEL_TYPE_CHANGED, channelType, channelId });