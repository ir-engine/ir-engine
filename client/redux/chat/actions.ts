import {
  LOADED_USER_CHANNELS,
  LOADED_GROUP_CHANNELS,
  LOADED_PARTY_CHANNEL,
  CREATED_MESSAGE,
  LOADED_MESSAGES,
  REMOVED_MESSAGE
} from '../actions'
import { Message } from '../../../shared/interfaces/Message'
import { MessageStatus } from '../../../shared/interfaces/MessageStatus'
import { MessageResult } from '../../../shared/interfaces/MessageResult'
import { Channel } from '../../../shared/interfaces/Channel'
import { ChannelResult } from '../../../shared/interfaces/ChannelResult'

export interface LoadedChannelsAction {
  type: string
  channels: Channel[],
  channelType: string,
  limit: number,
  skip: number,
  total: number
}

export interface LoadedChannelAction {
  type: string
  channel: Channel,
  channelType: string
}

export interface LoadedMessagesAction {
  type: string,
  channelType: string,
  channelId: string,
  messages: Message[]
}

export interface RemovedMessageAction {
  type: string,
  channelId: string
}

export interface CreatedMessageAction {
  type: string,
  channelId: string
}

export type ChatAction =
    LoadedChannelsAction
    | LoadedChannelAction
    | CreatedMessageAction
    | LoadedMessagesAction
    | RemovedMessageAction

export function loadedUserChannels(channelResult: ChannelResult): ChatAction {
  return {
    type: LOADED_USER_CHANNELS,
    channelType: 'user',
    channels: channelResult.data,
    limit: channelResult.limit,
    skip: channelResult.skip,
    total: channelResult.total
  }
}

export function loadedGroupChannels(channelResult: ChannelResult): ChatAction {
  return {
    type: LOADED_GROUP_CHANNELS,
    channelType: 'group',
    channels: channelResult.data,
    limit: channelResult.limit,
    skip: channelResult.skip,
    total: channelResult.total
  }
}

export function loadedPartyChannel(channelResult: Channel): ChatAction {
  return {
    type: LOADED_PARTY_CHANNEL,
    channelType: 'party',
    channel: channelResult
  }
}

export function createdMessage(channelType: string, message: Message): ChatAction {
  return {
    type: CREATED_MESSAGE,
    channelType: channelType,
    channelId: message.channelId
  }
}

export function loadedMessages(channelType: string, channelId: string, messageResult: MessageResult): ChatAction {
  return {
    type: LOADED_MESSAGES,
    channelType: channelType,
    messages: messageResult.data,
    channelId: channelId
  }
}

export function removedMessage(channelType: string, channelId: string): ChatAction {
  return {
    type: REMOVED_MESSAGE,
    channelType: channelType,
    channelId: channelId
  }
}