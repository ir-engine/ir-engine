import {
  CHAT_TARGET_SET,
  LOADED_CHANNELS,
  LOADED_USER_CHANNELS,
  LOADED_GROUP_CHANNELS,
  LOADED_PARTY_CHANNEL,
  CREATED_MESSAGE,
  LOADED_MESSAGES,
  REMOVED_MESSAGE, INVITE_TARGET_SET
} from '../actions'
import { Message } from '../../../shared/interfaces/Message'
import { MessageStatus } from '../../../shared/interfaces/MessageStatus'
import { MessageResult } from '../../../shared/interfaces/MessageResult'
import { Channel } from '../../../shared/interfaces/Channel'
import { ChannelResult } from '../../../shared/interfaces/ChannelResult'

export interface LoadedChannelsAction {
  type: string
  channels: Channel[]
  limit: number
  skip: number
  total: number
}

export interface LoadedChannelAction {
  type: string
  channel: Channel
  channelType: string
}

export interface LoadedMessagesAction {
  type: string
  channelId: string
  limit: number
  skip: number
  total: number
  messages: Message[]
}

export interface ChatTargetSetAction {
  type: string
  targetObjectType: string
  targetObject: any
}

export interface RemovedMessageAction {
  type: string
  messageId: string
  channelId: string
}

export interface CreatedMessageAction {
  type: string
  message: Message
}

export type ChatAction =
    LoadedChannelsAction
    | LoadedChannelAction
    | CreatedMessageAction
    | LoadedMessagesAction
    | RemovedMessageAction
    | ChatTargetSetAction

export function loadedChannels(channelResult: ChannelResult): ChatAction {
  return {
    type: LOADED_CHANNELS,
    channels: channelResult.data,
    limit: channelResult.limit,
    skip: channelResult.skip,
    total: channelResult.total
  }
}

// export function loadedUserChannels(channelResult: ChannelResult): ChatAction {
//   return {
//     type: LOADED_USER_CHANNELS,
//     channelType: 'user',
//     channels: channelResult.data,
//     limit: channelResult.limit,
//     skip: channelResult.skip,
//     total: channelResult.total
//   }
// }
//
// export function loadedGroupChannels(channelResult: ChannelResult): ChatAction {
//   return {
//     type: LOADED_GROUP_CHANNELS,
//     channelType: 'group',
//     channels: channelResult.data,
//     limit: channelResult.limit,
//     skip: channelResult.skip,
//     total: channelResult.total
//   }
// }
//
// export function loadedPartyChannel(channelResult: Channel): ChatAction {
//   return {
//     type: LOADED_PARTY_CHANNEL,
//     channelType: 'party',
//     channel: channelResult
//   }
// }

export function createdMessage(channelType: string, message: Message): ChatAction {
  return {
    type: CREATED_MESSAGE,
    message: message
  }
}

export function loadedMessages(channelId: string, messageResult: MessageResult): ChatAction {
  return {
    type: LOADED_MESSAGES,
    messages: messageResult.data,
    limit: messageResult.limit,
    skip: messageResult.skip,
    total: messageResult.total,
    channelId: channelId
  }
}

export function removedMessage(messageId: string, channelId: string): ChatAction {
  return {
    type: REMOVED_MESSAGE,
    messageId: messageId,
    channelId: channelId
  }
}

export function setChatTarget(targetObjectType: string, targetObject: any): ChatAction {
  return {
    type: CHAT_TARGET_SET,
    targetObjectType: targetObjectType,
    targetObject: targetObject
  }
}