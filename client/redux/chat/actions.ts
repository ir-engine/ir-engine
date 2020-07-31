import {
  CHAT_TARGET_SET,
  LOADED_CHANNELS,
  CREATED_MESSAGE,
  LOADED_MESSAGES,
  PATCHED_MESSAGE,
  REMOVED_MESSAGE,
  SET_MESSAGE_SCROLL_INIT
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
  targetChannelId: string
}

export interface RemovedMessageAction {
  type: string
  message: Message
}

export interface PatchedMessageAction {
  type: string
  message: Message
}

export interface CreatedMessageAction {
  type: string
  message: Message
}

export interface SetMessageScrollInitAction {
  type: string
  value: boolean
}

export type ChatAction =
    LoadedChannelsAction
    | LoadedChannelAction
    | CreatedMessageAction
    | LoadedMessagesAction
    | PatchedMessageAction
    | RemovedMessageAction
    | ChatTargetSetAction
    | SetMessageScrollInitAction

export function loadedChannels(channelResult: ChannelResult): ChatAction {
  return {
    type: LOADED_CHANNELS,
    channels: channelResult.data,
    limit: channelResult.limit,
    skip: channelResult.skip,
    total: channelResult.total
  }
}

export function createdMessage(message: Message): ChatAction {
  return {
    type: CREATED_MESSAGE,
    message: message
  }
}

export function patchedMessage(message: Message): ChatAction {
  return {
    type: PATCHED_MESSAGE,
    message: message
  }
}

export function removedMessage(message: Message): ChatAction {
  return {
    type: REMOVED_MESSAGE,
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

export function setChatTarget(targetObjectType: string, targetObject: any, targetChannelId: string): ChatAction {
  return {
    type: CHAT_TARGET_SET,
    targetObjectType: targetObjectType,
    targetObject: targetObject,
    targetChannelId: targetChannelId
  }
}

export function setMessageScrollInit(value: boolean): ChatAction {
  return {
    type: SET_MESSAGE_SCROLL_INIT,
    value: value
  }
}