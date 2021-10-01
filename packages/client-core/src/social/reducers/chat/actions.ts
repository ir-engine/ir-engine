import {
  CHAT_TARGET_SET,
  LOADED_CHANNEL,
  LOADED_CHANNELS,
  CREATED_MESSAGE,
  LOADED_MESSAGES,
  PATCHED_MESSAGE,
  REMOVED_MESSAGE,
  SET_MESSAGE_SCROLL_INIT,
  CREATED_CHANNEL,
  PATCHED_CHANNEL,
  REMOVED_CHANNEL
} from '../actions'
import { User } from '@xrengine/common/src/interfaces/User'
import { Message } from '@xrengine/common/src/interfaces/Message'
import { MessageResult } from '@xrengine/common/src/interfaces/MessageResult'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { ChannelResult } from '@xrengine/common/src/interfaces/ChannelResult'
import { handleCommand, isCommand } from '@xrengine/engine/src/common/functions/commandHandler'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { isBot } from '@xrengine/engine/src/common/functions/isBot'
import { isPlayerLocal } from '@xrengine/engine/src/networking/utils/isPlayerLocal'
import {
  getChatMessageSystem,
  hasSubscribedToChatSystem,
  removeMessageSystem
} from '@xrengine/engine/src/networking/utils/chatSystem'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

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
  selfUser: User
}

export interface SetMessageScrollInitAction {
  type: string
  value: boolean
}

export interface CreatedChannelAction {
  type: string
  channel: Channel
}

export interface PatchedChannelAction {
  type: string
  channel: Channel
}

export interface RemovedChannelAction {
  type: string
  channel: Channel
}

export type ChatAction =
  | LoadedChannelsAction
  | LoadedChannelAction
  | CreatedMessageAction
  | LoadedMessagesAction
  | PatchedMessageAction
  | RemovedMessageAction
  | ChatTargetSetAction
  | SetMessageScrollInitAction
  | CreatedChannelAction
  | PatchedChannelAction
  | RemovedChannelAction

export function loadedChannel(channelResult: Channel, channelFetchedType: string): ChatAction {
  return {
    type: LOADED_CHANNEL,
    channel: channelResult,
    channelType: channelFetchedType
  }
}

export function loadedChannels(channelResult: ChannelResult): ChatAction {
  return {
    type: LOADED_CHANNELS,
    channels: channelResult.data,
    limit: channelResult.limit,
    skip: channelResult.skip,
    total: channelResult.total
  }
}

export function createdMessage(message: Message, selfUser: User): ChatAction {
  if (message != undefined && message.text != undefined) {
    if (isPlayerLocal(message.senderId)) {
      if (handleCommand(message.text, useWorld().localClientEntity, message.senderId)) return
      else {
        const system = getChatMessageSystem(message.text)
        if (system !== 'none') {
          message.text = removeMessageSystem(message.text)
          if (!isBot(window) && !Engine.isBot && !hasSubscribedToChatSystem(selfUser.id, system)) return
        }
      }
    } else {
      const system = getChatMessageSystem(message.text)
      if (system !== 'none') {
        message.text = removeMessageSystem(message.text)
        if (!isBot(window) && !Engine.isBot && !Engine.isBot && !hasSubscribedToChatSystem(selfUser.id, system)) return
      } else if (isCommand(message.text) && !Engine.isBot && !isBot(window)) return
    }
  }

  return {
    type: CREATED_MESSAGE,
    message: message,
    selfUser: selfUser
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

export function createdChannel(channel: Channel) {
  return {
    type: CREATED_CHANNEL,
    channel: channel
  }
}

export function patchedChannel(channel: Channel) {
  return {
    type: PATCHED_CHANNEL,
    channel: channel
  }
}

export function removedChannel(channel: Channel) {
  return {
    type: REMOVED_CHANNEL,
    channel: channel
  }
}
