import { Paginated } from '@feathersjs/feathers'
import { none } from '@hookstate/core'
import { useEffect } from 'react'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Group } from '@xrengine/common/src/interfaces/Group'
import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { Message } from '@xrengine/common/src/interfaces/Message'
import { Party } from '@xrengine/common/src/interfaces/Party'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:social' })

interface ChatMessageProps {
  targetObjectId: string
  targetObjectType: string
  text: string
}

//State

// TODO: find existing interfaces for these or move these to @xrengine/common/src/interfaces
const ChatState = defineState({
  name: 'ChatState',
  initial: () => ({
    channels: {
      channels: [] as Channel[],
      limit: 5,
      skip: 0,
      total: 0,
      updateNeeded: true
    },
    targetObjectType: '',
    targetObjectId: '',
    targetObject: {} as UserInterface | Group | Party | Instance,
    targetChannelId: '',
    updateMessageScroll: false,
    messageScrollInit: false,
    instanceChannelFetching: false,
    instanceChannelFetched: false,
    partyChannelFetching: false,
    partyChannelFetched: false,
    messageCreated: false
  })
})

export const ChatServiceReceptor = (action) => {
  const s = getState(ChatState)
  matches(action)
    .when(ChatAction.loadedChannelsAction.matches, (action) => {
      return s.channels.merge({
        limit: action.channels.limit,
        skip: action.channels.skip,
        total: action.channels.total,
        updateNeeded: false,
        channels: action.channels.data
      })
    })
    .when(ChatAction.loadedChannelAction.matches, (action) => {
      let findIndex
      if (typeof action.channel.id === 'string')
        findIndex = s.channels.channels.findIndex((c) => c.id.value === action.channel.id)
      let idx = findIndex > -1 ? findIndex : s.channels.channels.length
      s.channels.channels[idx].set(action.channel)
      if (action.channelType === 'instance') {
        const endedInstanceChannelIndex = s.channels.channels.findIndex(
          (channel) => channel.channelType.value === 'instance' && channel.id.value !== action.channel.id
        )
        if (endedInstanceChannelIndex > -1) s.channels.channels[endedInstanceChannelIndex].set(none)
        s.merge({
          instanceChannelFetched: true,
          instanceChannelFetching: false
        })
      } else if (action.channelType === 'party') {
        const endedPartyChannelIndex = s.channels.channels.findIndex(
          (channel) => channel.channelType.value === 'party' && channel.id.value !== action.channel.id
        )
        if (endedPartyChannelIndex > -1) s.channels.channels[endedPartyChannelIndex].set(none)
        s.merge({
          partyChannelFetched: true,
          partyChannelFetching: false
        })
      }
      s.merge({ messageCreated: true })
      return
    })
    .when(ChatAction.createdMessageAction.matches, (action) => {
      const channelId = action.message.channelId
      const selfUser = action.selfUser
      const channel = s.channels.channels.find((c) => c.id.value === channelId)

      if (!channel) {
        s.channels.updateNeeded.set(true)
      } else {
        if (!channel.messages.length) channel.messages.set([action.message])
        else channel.messages[channel.messages.length].set(action.message)
      }

      s.updateMessageScroll.set(true)
      s.merge({ messageCreated: true })
      if (s.targetChannelId.value.length === 0 && channel) {
        const channelType = channel.channelType.value
        const targetObject =
          channelType === 'user'
            ? channel.userId1.value === selfUser.id
              ? channel.user1
              : channel.user2
            : channelType === 'group'
            ? channel.group
            : channelType === 'instance'
            ? channel.instance
            : channel.party
        s.merge({
          targetChannelId: channelId,
          targetObjectType: channelType,
          targetObject: targetObject.value,
          targetObjectId: targetObject.id.value
        })
      }
      return
    })
    .when(ChatAction.loadedMessagesAction.matches, (action) => {
      const channelId = action.channelId
      const channel = s.channels.channels.find((c) => c.id.value === channelId)
      if (channel) {
        for (const m of action.messages) {
          const message = channel.messages.find((m2) => m2.id.value === m.id)
          if (message) message.set(m)
          else channel.messages[channel.messages.length].set(m)
        }
      }

      return
    })
    .when(ChatAction.removedMessageAction.matches, (action) => {
      const channelId = action.message.channelId
      const channel = s.channels.channels.find((c) => c.id.value === channelId)
      if (channel) {
        const messageIdx = channel.messages.findIndex((m) => m.id.value === action.message.id)
        if (messageIdx > -1) channel.messages.merge({ [messageIdx]: none })
      } else {
        s.channels.updateNeeded.set(true)
      }

      return
    })
    .when(ChatAction.patchedMessageAction.matches, (action) => {
      const channelId = action.message.channelId
      const channel = s.channels.channels.find((c) => c.id.value === channelId)
      if (channel) {
        const messageIdx = channel.messages.findIndex((m) => m.id.value === action.message.id)
        if (messageIdx > -1) channel.messages[messageIdx].set(action.message)
      } else {
        s.channels.updateNeeded.set(true)
      }

      return
    })
    .when(ChatAction.createdChannelAction.matches, (action) => {
      const channelId = action.channel.id
      const channel = s.channels.channels.find((c) => c.id.value === channelId)

      if (channel) {
        channel.merge(action.channel)
      } else {
        s.channels.channels[s.channels.channels.length].set(action.channel)
      }

      return
    })
    .when(ChatAction.patchedChannelAction.matches, (action) => {
      const channelId = action.channel.id
      const channel = s.channels.channels.find((c) => c.id.value === channelId)

      if (channel) {
        channel.merge(action.channel)
      } else {
        s.channels.channels[s.channels.channels.length].set(action.channel)
      }
      s.merge({ messageCreated: false })
      return
    })
    .when(ChatAction.removedChannelAction.matches, (action) => {
      const channelId = action.channel.id
      const channelIdx = s.channels.channels.findIndex((c) => c.id.value === channelId)
      if (channelIdx > -1) {
        s.channels.channels[channelIdx].set(none)
      }
      return
    })
    .when(ChatAction.setChatTargetAction.matches, (action) => {
      const { targetObjectType, targetObject, targetChannelId } = action
      return s.merge({
        targetObjectType: targetObjectType,
        targetObjectId: targetObject.id,
        targetObject: targetObject,
        targetChannelId: targetChannelId,
        updateMessageScroll: true,
        messageScrollInit: true
      })
    })
    .when(ChatAction.setMessageScrollInitAction.matches, (action) => {
      const { value } = action
      return s.merge({ messageScrollInit: value })
    })
    .when(ChatAction.fetchingInstanceChannelAction.matches, () => {
      return s.merge({ instanceChannelFetching: true })
    })
    .when(ChatAction.fetchingPartyChannelAction.matches, () => {
      return s.merge({ partyChannelFetching: true })
    })
    .when(ChatAction.setUpdateMessageScrollAction.matches, (action) => {
      return s.merge({ updateMessageScroll: action.value })
    })
    .when(ChatAction.refetchPartyChannelAction.matches, () => {
      return s.merge({ partyChannelFetched: false })
    })
    .when(ChatAction.removePartyChannelAction.matches, () => {
      const endedPartyChannelIndex = s.channels.channels.findIndex((channel) => channel.channelType.value === 'party')
      if (endedPartyChannelIndex > -1) s.channels.channels[endedPartyChannelIndex].set(none)
      return s
    })
}

export const accessChatState = () => getState(ChatState)

export const useChatState = () => useState(accessChatState())

globalThis.chatState = ChatState

//Service
export const ChatService = {
  getChannels: async (skip?: number, limit?: number) => {
    try {
      const chatState = accessChatState().value

      const channelResult = (await API.instance.client.service('channel').find({
        query: {
          $limit: limit != null ? limit : chatState.channels.limit,
          $skip: skip != null ? skip : chatState.channels.skip
        }
      })) as Paginated<Channel>
      dispatchAction(ChatAction.loadedChannelsAction({ channels: channelResult }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getInstanceChannel: async () => {
    try {
      const channelResult = (await API.instance.client.service('channel').find({
        query: {
          channelType: 'instance',
          instanceId: Engine.instance.currentWorld.worldNetwork.hostId
        }
      })) as Channel[]
      if (!channelResult.length) return setTimeout(() => ChatService.getInstanceChannel(), 2000)
      dispatchAction(ChatAction.loadedChannelAction({ channel: channelResult[0], channelType: 'instance' }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getPartyChannel: async () => {
    try {
      const selfUser = accessAuthState().user.value
      const channelResult = (await API.instance.client.service('channel').find({
        query: {
          channelType: 'party',
          partyId: selfUser.partyId
        }
      })) as Channel[]
      if (channelResult[0])
        dispatchAction(ChatAction.loadedChannelAction({ channel: channelResult[0], channelType: 'party' }))
      else dispatchAction(ChatAction.removePartyChannelAction({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createMessage: async (values: ChatMessageProps) => {
    try {
      const chatState = accessChatState().value
      const data = {
        targetObjectId: chatState.targetObjectId || values.targetObjectId || '',
        targetObjectType: chatState.targetObjectType || values.targetObjectType || 'party',
        text: values.text
      }
      if (!data.targetObjectId || !data.targetObjectType) {
        logger.warn({ data }, 'Invalid data, something is null.')
        return
      }
      await API.instance.client.service('message').create(data)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  sendChatMessage: (values: ChatMessageProps) => {
    try {
      API.instance.client.service('message').create({
        targetObjectId: values.targetObjectId,
        targetObjectType: values.targetObjectType,
        text: values.text
      })
    } catch (err) {
      logger.error(err, 'Error in sendChatMessage.')
    }
  },
  sendMessage: (text: string) => {
    const user = accessAuthState().user.value
    if (user.instanceId && text) {
      ChatService.sendChatMessage({
        targetObjectId: user.instanceId,
        targetObjectType: 'instance',
        text: text
      })
    }
  },
  getChannelMessages: async (channelId: string, skip?: number, limit?: number) => {
    if (channelId && channelId.length > 0) {
      try {
        const chatState = accessChatState().value
        const messageResult = (await API.instance.client.service('message').find({
          query: {
            channelId: channelId,
            $sort: {
              createdAt: -1
            },
            $limit: limit != null ? limit : chatState.channels.channels[channelId].limit,
            $skip: skip != null ? skip : chatState.channels.channels[channelId].skip
          }
        })) as Paginated<Message>
        dispatchAction(ChatAction.loadedMessagesAction({ channelId: channelId, messages: messageResult.data }))
      } catch (err) {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      }
    }
  },
  removeMessage: async (messageId: string) => {
    try {
      await API.instance.client.service('message').remove(messageId)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchMessage: async (messageId: string, text: string) => {
    try {
      await API.instance.client.service('message').patch(messageId, {
        text: text
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  updateChatTarget: async (targetObjectType: string, targetObject: any) => {
    if (!targetObject) {
      dispatchAction(
        ChatAction.setChatTargetAction({ targetObjectType: targetObjectType, targetObject, targetChannelId: '' })
      )
    } else {
      const targetChannelResult = (await API.instance.client.service('channel').find({
        query: {
          findTargetId: true,
          targetObjectType: targetObjectType,
          targetObjectId: targetObject.id
        }
      })) as Paginated<Channel>
      dispatchAction(
        ChatAction.setChatTargetAction({
          targetObjectType: targetObjectType,
          targetObject,
          targetChannelId: targetChannelResult.total > 0 ? targetChannelResult.data[0].id : ''
        })
      )
    }
  },
  clearChatTargetIfCurrent: async (targetObjectType: string, targetObject: any) => {
    const chatState = accessChatState().value
    const chatStateTargetObjectType = chatState.targetObjectType
    const chatStateTargetObjectId = chatState.targetObjectId
    if (
      targetObjectType === chatStateTargetObjectType &&
      (targetObject.id === chatStateTargetObjectId ||
        targetObject.relatedUserId === chatStateTargetObjectId ||
        targetObject.userId === chatStateTargetObjectId)
    ) {
      dispatchAction(ChatAction.setChatTargetAction({ targetObjectType: '', targetObject: {}, targetChannelId: '' }))
    }
  },
  updateMessageScrollInit: async (value: boolean) => {
    dispatchAction(ChatAction.setMessageScrollInitAction({ value }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const messageCreatedListener = (params) => {
        const selfUser = accessAuthState().user.value
        dispatchAction(ChatAction.createdMessageAction({ message: params.message, selfUser: selfUser }))
      }

      const messagePatchedListener = (params) => {
        dispatchAction(ChatAction.patchedMessageAction({ message: params.message }))
      }

      const messageRemovedListener = (params) => {
        dispatchAction(ChatAction.removedMessageAction({ message: params.message }))
      }

      const channelCreatedListener = (params) => {
        dispatchAction(ChatAction.createdChannelAction({ channel: params.channel }))
      }

      const channelPatchedListener = (params) => {
        dispatchAction(ChatAction.patchedChannelAction({ channel: params.channel }))
      }

      const channelRemovedListener = (params) => {
        dispatchAction(ChatAction.removedChannelAction({ channel: params.channel }))
      }

      API.instance.client.service('message').on('created', messageCreatedListener)
      API.instance.client.service('message').on('patched', messagePatchedListener)
      API.instance.client.service('message').on('removed', messageRemovedListener)
      API.instance.client.service('channel').on('created', channelCreatedListener)
      API.instance.client.service('channel').on('patched', channelPatchedListener)
      API.instance.client.service('channel').on('removed', channelRemovedListener)

      return () => {
        API.instance.client.service('message').off('created', messageCreatedListener)
        API.instance.client.service('message').off('patched', messagePatchedListener)
        API.instance.client.service('message').off('removed', messageRemovedListener)
        API.instance.client.service('channel').off('created', channelCreatedListener)
        API.instance.client.service('channel').off('patched', channelPatchedListener)
        API.instance.client.service('channel').off('removed', channelRemovedListener)
      }
    }, [])
  }
}

//Action

export class ChatAction {
  static loadedChannelAction = defineAction({
    type: 'xre.client.Chat.LOADED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>,
    channelType: matches.string
  })

  static loadedChannelsAction = defineAction({
    type: 'xre.client.Chat.LOADED_CHANNELS' as const,
    channels: matches.any as Validator<unknown, Paginated<Channel>>
  })

  static createdMessageAction = defineAction({
    type: 'xre.client.Chat.CREATED_MESSAGE' as const,
    message: matches.object as Validator<unknown, Message>,
    selfUser: matches.object as Validator<unknown, UserInterface>
  })

  static patchedMessageAction = defineAction({
    type: 'xre.client.Chat.PATCHED_MESSAGE' as const,
    message: matches.object as Validator<unknown, Message>
  })

  static removedMessageAction = defineAction({
    type: 'xre.client.Chat.REMOVED_MESSAGE' as const,
    message: matches.object as Validator<unknown, Message>
  })

  static loadedMessagesAction = defineAction({
    type: 'xre.client.Chat.LOADED_MESSAGES' as const,
    messages: matches.array as Validator<unknown, Message[]>,
    limit: matches.any,
    skip: matches.any,
    total: matches.any,
    channelId: matches.any
  })

  static setChatTargetAction = defineAction({
    type: 'xre.client.Chat.CHAT_TARGET_SET' as const,
    targetObjectType: matches.any,
    targetObject: matches.any,
    targetChannelId: matches.any
  })

  static setMessageScrollInitAction = defineAction({
    type: 'xre.client.Chat.SET_MESSAGE_SCROLL_INIT' as const,
    value: matches.boolean
  })

  static createdChannelAction = defineAction({
    type: 'xre.client.Chat.CREATED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>
  })

  static patchedChannelAction = defineAction({
    type: 'xre.client.Chat.PATCHED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>
  })

  static removedChannelAction = defineAction({
    type: 'xre.client.Chat.REMOVED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>
  })

  static fetchingInstanceChannelAction = defineAction({
    type: 'xre.client.Chat.FETCHING_INSTANCE_CHANNEL' as const
  })

  static fetchingPartyChannelAction = defineAction({
    type: 'xre.client.Chat.FETCHING_PARTY_CHANNEL' as const
  })

  static setUpdateMessageScrollAction = defineAction({
    type: 'xre.client.Chat.SET_UPDATE_MESSAGE_SCROLL' as const,
    value: matches.boolean
  })

  static refetchPartyChannelAction = defineAction({
    type: 'xre.client.Chat.REFETCH_PARTY_CHANNEL' as const
  })

  static removePartyChannelAction = defineAction({
    type: 'xre.client.Chat.REMOVE_PARTY_CHANNEL' as const
  })
}
