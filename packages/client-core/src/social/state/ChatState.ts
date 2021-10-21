import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ChatActionType } from './ChatActions'
import _ from 'lodash'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { User } from '@xrengine/common/src/interfaces/User'
import { Group } from '@xrengine/common/src/interfaces/Group'
import { Party } from '@xrengine/common/src/interfaces/Party'
import { Instance } from '@xrengine/common/src/interfaces/Instance'

// TODO: find existing interfaces for these or move these to @xrengine/common/src/interfaces

const state = createState({
  channels: {
    channels: [] as Channel[],
    limit: 5,
    skip: 0,
    total: 0,
    updateNeeded: true,
    fetchingInstanceChannel: false
  },
  targetObjectType: '',
  targetObject: {} as User | Group | Party | Instance,
  targetChannelId: '',
  updateMessageScroll: false,
  messageScrollInit: false,
  instanceChannelFetching: false,
  instanceChannelFetched: false
})

export const receptor = (action: ChatActionType): any => {
  state.batch((s) => {
    switch (action!.type) {
      case 'LOADED_CHANNELS':
        s.channels.merge({
          limit: action.limit,
          skip: action.skip,
          total: action.total,
          updateNeeded: false,
          channels: action.channels
        })
        return

      case 'LOADED_CHANNEL': {
        const idx =
          (typeof action.channel.id === 'string' &&
            s.channels.channels.findIndex((c) => c.id.value === action.channel.id)) ||
          s.channels.channels.length
        s.channels.channels[idx].set(action.channel)

        if (action.channelType === 'instance') {
          // TODO: WHYYY ARE WE DOING ALL THIS??
          s.channels.fetchingInstanceChannel.set(false)
          s.merge({
            instanceChannelFetched: true,
            instanceChannelFetching: false
          })
        }

        return
      }

      case 'CREATED_MESSAGE': {
        const channelId = action.message.channelId
        const selfUser = action.selfUser
        const channel = s.channels.channels.find((c) => c.id.value === channelId)

        if (!channel) {
          s.channels.updateNeeded.set(true)
        } else {
          channel.Messages[channel.Messages.length].set(action.message)
        }

        s.updateMessageScroll.set(true)

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
          s.merge({ targetChannelId: channelId, targetObjectType: channelType, targetObject: targetObject.value })
        }
        return
      }

      case 'LOADED_MESSAGES': {
        const channelId = action.channelId
        const channel = s.channels.channels.find((c) => c.id.value === channelId)
        if (channel) {
          for (const m of action.messages) {
            const message = channel.Messages.find((m2) => m2.id.value === m.id)
            if (message) message.set(m)
            else channel.Messages[channel.Messages.length].set(m)
          }
        }

        return
      }

      case 'REMOVED_MESSAGE': {
        const channelId = action.message.channelId
        const channel = s.channels.channels.find((c) => c.id.value === channelId)
        if (channel) {
          const messageIdx = channel.Messages.findIndex((m) => m.id.value === action.message.id)
          if (messageIdx > -1) channel.Messages.merge({ [messageIdx]: none })
        } else {
          s.channels.updateNeeded.set(true)
        }

        return
      }

      case 'PATCHED_MESSAGE': {
        const channelId = action.message.channelId
        const channel = s.channels.channels.find((c) => c.id.value === channelId)
        if (channel) {
          const messageIdx = channel.Messages.findIndex((m) => m.id.value === action.message.id)
          if (messageIdx > -1) channel.Messages[messageIdx].set(action.message)
        } else {
          s.channels.updateNeeded.set(true)
        }

        return
      }

      case 'CREATED_CHANNEL': {
        const channelId = action.channel.id
        const channel = s.channels.channels.find((c) => c.id.value === channelId)

        if (channel) {
          channel.set(action.channel)
        } else {
          s.channels.channels[s.channels.channels.length].set(action.channel)
        }

        return
      }

      case 'PATCHED_CHANNEL': {
        const channelId = action.channel.id
        const channel = s.channels.channels.find((c) => c.id.value === channelId)

        if (channel) {
          channel.set(action.channel)
        } else {
          s.channels.channels[s.channels.channels.length].set(action.channel)
        }

        return
      }

      case 'REMOVED_CHANNEL': {
        const channelId = action.channel.id
        const channelIdx = s.channels.channels.findIndex((c) => c.id.value === channelId)
        if (channelIdx > -1) {
          s.channels.channels[channelIdx].set(none)
        }
      }

      case 'CHAT_TARGET_SET':
        const { targetObjectType, targetObject, targetChannelId } = action
        return s.merge({
          targetObjectType: targetObjectType,
          targetObject: targetObject,
          targetChannelId: targetChannelId,
          updateMessageScroll: true,
          messageScrollInit: true
        })

      case 'SET_MESSAGE_SCROLL_INIT':
        const { value } = action
        return s.merge({ messageScrollInit: value })

      case 'FETCHING_INSTANCE_CHANNEL':
        return s.channels.merge({ fetchingInstanceChannel: true })

      case 'SET_UPDATE_MESSAGE_SCROLL': {
        return s.merge({ updateMessageScroll: action.value })
      }
    }
  }, action.type)
}

export const accessChatState = () => state

export const useChatState = () => useState(state) as any as typeof state
