/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { none } from '@hookstate/core'
import { useEffect } from 'react'

import { Channel } from '@etherealengine/common/src/interfaces/Channel'
import { Message } from '@etherealengine/common/src/interfaces/Message'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:social' })

export const ChatState = defineState({
  name: 'ChatState',
  initial: () => ({
    channels: {
      channels: [] as Channel[],
      limit: 5,
      skip: 0,
      total: 0,
      updateNeeded: true
    },
    targetChannelId: '',
    instanceChannelFetching: false,
    instanceChannelFetched: false,
    partyChannelFetching: false,
    partyChannelFetched: false,
    messageCreated: false
  })
})

export const ChatServiceReceptor = (action) => {
  const s = getMutableState(ChatState)
  matches(action)
    .when(ChatAction.loadedChannelsAction.matches, (action) => {
      return s.channels.merge({
        updateNeeded: false,
        channels: action.channels
      })
    })
    .when(ChatAction.loadedChannelAction.matches, (action) => {
      let findIndex
      if (typeof action.channel.id === 'string')
        findIndex = s.channels.channels.findIndex((c) => c.id.value === action.channel.id)
      let idx = findIndex > -1 ? findIndex : s.channels.channels.length
      s.channels.channels[idx].set(action.channel)
      const endedInstanceChannelIndex = s.channels.channels.findIndex(
        (channel) => channel.id.value !== action.channel.id
      )
      if (endedInstanceChannelIndex > -1) s.channels.channels[endedInstanceChannelIndex].set(none)
      s.merge({
        instanceChannelFetched: true,
        instanceChannelFetching: false
      })
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
        else {
          const existingMessage = channel.messages.find((message) => message.id.value === action.message.id)
          if (!existingMessage) channel.messages[channel.messages.length].set(action.message)
        }
      }

      s.merge({ messageCreated: true })
      if (s.targetChannelId.value.length === 0 && channel) {
        s.merge({ targetChannelId: channelId })
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
      const { targetChannelId } = action
      return s.merge({
        targetChannelId: targetChannelId
      })
    })
}

globalThis.chatState = ChatState

//Service
export const ChatService = {
  getChannels: async (skip?: number, limit?: number) => {
    try {
      const chatState = getMutableState(ChatState).value

      const channelResult = (await Engine.instance.api.service('channel').find({})) as Channel[]
      dispatchAction(ChatAction.loadedChannelsAction({ channels: channelResult }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getInstanceChannel: async () => {
    try {
      const channelResult = (await Engine.instance.api.service('channel').find({
        query: {
          instanceId: Engine.instance.worldNetwork.hostId
        }
      })) as Channel[]
      if (!channelResult.length) return setTimeout(() => ChatService.getInstanceChannel(), 2000)
      dispatchAction(ChatAction.loadedChannelAction({ channel: channelResult[0] }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getPartyChannel: async () => {
    try {
      const selfUser = getMutableState(AuthState).user.value
      const channelResult = (await Engine.instance.api.service('channel').find({
        query: {
          partyId: selfUser.partyId
        }
      })) as Channel[]
      if (channelResult[0]) dispatchAction(ChatAction.loadedChannelAction({ channel: channelResult[0] }))
      else dispatchAction(ChatAction.removePartyChannelAction({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createChannel: async (users: UserId[]) => {
    try {
      await Engine.instance.api.service('channel').create({
        users
      })
      ChatService.getChannels()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createMessage: async (text: string) => {
    try {
      const chatState = getMutableState(ChatState).value
      if (!chatState.targetChannelId) {
        logger.error('Error no target channel found')
        return
      }
      await Engine.instance.api.service('message').create({
        channelId: chatState.targetChannelId,
        text
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  clearChatTargetIfCurrent: async (targetChannelId: string) => {
    const chatState = getMutableState(ChatState).value
    const chatStateTargetObjectId = chatState.targetChannelId
    if (targetChannelId === chatStateTargetObjectId) {
      dispatchAction(ChatAction.setChatTargetAction({ targetChannelId: '' }))
    }
  },
  useAPIListeners: () => {
    useEffect(() => {
      const messageCreatedListener = (params) => {
        const selfUser = getMutableState(AuthState).user.value
        dispatchAction(ChatAction.createdMessageAction({ message: params, selfUser }))
      }

      const messagePatchedListener = (params) => {
        dispatchAction(ChatAction.patchedMessageAction({ message: params }))
      }

      const messageRemovedListener = (params) => {
        dispatchAction(ChatAction.removedMessageAction({ message: params }))
      }

      const channelCreatedListener = (params) => {
        dispatchAction(ChatAction.createdChannelAction(params))
      }

      const channelPatchedListener = (params) => {
        dispatchAction(ChatAction.patchedChannelAction(params))
      }

      const channelRemovedListener = (params) => {
        dispatchAction(ChatAction.removedChannelAction(params))
      }

      Engine.instance.api.service('message').on('created', messageCreatedListener)
      Engine.instance.api.service('message').on('patched', messagePatchedListener)
      Engine.instance.api.service('message').on('removed', messageRemovedListener)
      Engine.instance.api.service('channel').on('created', channelCreatedListener)
      Engine.instance.api.service('channel').on('patched', channelPatchedListener)
      Engine.instance.api.service('channel').on('removed', channelRemovedListener)

      return () => {
        Engine.instance.api.service('message').off('created', messageCreatedListener)
        Engine.instance.api.service('message').off('patched', messagePatchedListener)
        Engine.instance.api.service('message').off('removed', messageRemovedListener)
        Engine.instance.api.service('channel').off('created', channelCreatedListener)
        Engine.instance.api.service('channel').off('patched', channelPatchedListener)
        Engine.instance.api.service('channel').off('removed', channelRemovedListener)
      }
    }, [])
  }
}

//Action

export class ChatAction {
  static loadedChannelAction = defineAction({
    type: 'ee.client.Chat.LOADED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>
  })

  static loadedChannelsAction = defineAction({
    type: 'ee.client.Chat.LOADED_CHANNELS' as const,
    channels: matches.any as Validator<unknown, Channel[]>
  })

  static createdMessageAction = defineAction({
    type: 'ee.client.Chat.CREATED_MESSAGE' as const,
    message: matches.object as Validator<unknown, Message>,
    selfUser: matches.object as Validator<unknown, UserInterface>
  })

  static patchedMessageAction = defineAction({
    type: 'ee.client.Chat.PATCHED_MESSAGE' as const,
    message: matches.object as Validator<unknown, Message>
  })

  static removedMessageAction = defineAction({
    type: 'ee.client.Chat.REMOVED_MESSAGE' as const,
    message: matches.object as Validator<unknown, Message>
  })

  static loadedMessagesAction = defineAction({
    type: 'ee.client.Chat.LOADED_MESSAGES' as const,
    messages: matches.array as Validator<unknown, Message[]>,
    limit: matches.any,
    skip: matches.any,
    total: matches.any,
    channelId: matches.any
  })

  static setChatTargetAction = defineAction({
    type: 'ee.client.Chat.CHAT_TARGET_SET' as const,
    targetChannelId: matches.any
  })

  static setMessageScrollInitAction = defineAction({
    type: 'ee.client.Chat.SET_MESSAGE_SCROLL_INIT' as const,
    value: matches.boolean
  })

  static createdChannelAction = defineAction({
    type: 'ee.client.Chat.CREATED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>
  })

  static patchedChannelAction = defineAction({
    type: 'ee.client.Chat.PATCHED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>
  })

  static removedChannelAction = defineAction({
    type: 'ee.client.Chat.REMOVED_CHANNEL' as const,
    channel: matches.object as Validator<unknown, Channel>
  })

  static refetchPartyChannelAction = defineAction({
    type: 'ee.client.Chat.REFETCH_PARTY_CHANNEL' as const
  })

  static removePartyChannelAction = defineAction({
    type: 'ee.client.Chat.REMOVE_PARTY_CHANNEL' as const
  })
}
