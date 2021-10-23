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

export const ChatAction = {
  loadedChannel: (channelResult: Channel, channelFetchedType: string) => {
    return {
      type: 'LOADED_CHANNEL' as const,
      channel: channelResult,
      channelType: channelFetchedType
    }
  },
  loadedChannels: (channelResult: ChannelResult) => {
    return {
      type: 'LOADED_CHANNELS' as const,
      channels: channelResult.data,
      limit: channelResult.limit,
      skip: channelResult.skip,
      total: channelResult.total
    }
  },
  createdMessage: (message: Message, selfUser: User) => {
    if (message != undefined && message.text != undefined) {
      if (isPlayerLocal(message.senderId)) {
        if (handleCommand(message.text, Engine.defaultWorld.localClientEntity, message.senderId)) return
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
          if (!isBot(window) && !Engine.isBot && !Engine.isBot && !hasSubscribedToChatSystem(selfUser.id, system))
            return
        } else if (isCommand(message.text) && !Engine.isBot && !isBot(window)) return
      }
    }

    return {
      type: 'CREATED_MESSAGE' as const,
      message: message,
      selfUser: selfUser
    }
  },
  patchedMessage: (message: Message) => {
    return {
      type: 'PATCHED_MESSAGE' as const,
      message: message
    }
  },
  removedMessage: (message: Message) => {
    return {
      type: 'REMOVED_MESSAGE' as const,
      message: message
    }
  },
  loadedMessages: (channelId: string, messageResult: MessageResult) => {
    return {
      type: 'LOADED_MESSAGES' as const,
      messages: messageResult.data,
      limit: messageResult.limit,
      skip: messageResult.skip,
      total: messageResult.total,
      channelId: channelId
    }
  },
  setChatTarget: (targetObjectType: string, targetObject: any, targetChannelId: string) => {
    return {
      type: 'CHAT_TARGET_SET' as const,
      targetObjectType: targetObjectType,
      targetObject: targetObject,
      targetChannelId: targetChannelId
    }
  },
  setMessageScrollInit: (value: boolean) => {
    return {
      type: 'SET_MESSAGE_SCROLL_INIT' as const,
      value: value
    }
  },
  createdChannel: (channel: Channel) => {
    return {
      type: 'CREATED_CHANNEL' as const,
      channel: channel
    }
  },
  patchedChannel: (channel: Channel) => {
    return {
      type: 'PATCHED_CHANNEL' as const,
      channel: channel
    }
  },
  removedChannel: (channel: Channel) => {
    return {
      type: 'REMOVED_CHANNEL' as const,
      channel: channel
    }
  },
  fetchingInstanceChannel: () => {
    return {
      type: 'FETCHING_INSTANCE_CHANNEL' as const
    }
  },
  setUpdateMessageScroll: (value: boolean) => {
    return {
      type: 'SET_UPDATE_MESSAGE_SCROLL' as const,
      value: value
    }
  }
}

export type ChatActionType = ReturnType<typeof ChatAction[keyof typeof ChatAction]>
