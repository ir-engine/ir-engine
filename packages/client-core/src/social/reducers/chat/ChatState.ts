import { createState, useState, none, Downgraded } from '@hookstate/core'
import { ChatActionType } from './ChatActions'
import { Message } from '@xrengine/common/src/interfaces/Message'
import _ from 'lodash'
import moment from 'moment'

const state = createState({
  channels: {
    channels: {},
    limit: 5,
    skip: 0,
    total: 0,
    updateNeeded: true,
    fetchingInstanceChannel: false
  },
  targetObjectType: '',
  targetObject: {
    id: '',
    name: ''
  },
  targetChannelId: '',
  updateMessageScroll: false,
  messageScrollInit: false,
  instanceChannelFetching: false,
  instanceChannelFetched: false
})

export const chatReducer = (_, action: ChatActionType) => {
  Promise.resolve().then(() => chatReceptor(action))
  return state.attach(Downgraded).value
}

const chatReceptor = (action: ChatActionType): any => {
  let updateMap, localAction, updateMapChannels, updateMapChannelsChild, returned
  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_CHANNELS':
        localAction = action
        updateMap = state.channels.value
        updateMap.limit = localAction.limit
        updateMap.skip = localAction.skip
        updateMap.total = localAction.total
        updateMapChannels = updateMap.channels
        updateMap.updateNeeded = false
        localAction.channels.forEach((channel) => {
          if (updateMapChannels[channel.id] == null) {
            channel.updateNeeded = true
            channel.limit = 8
            channel.skip = 0
            channel.total = 0
            updateMapChannels[channel.id] = channel
          }
        })
        updateMap.channels = updateMapChannels
        return s.merge({ channels: updateMap })
      case 'LOADED_CHANNEL':
        localAction = action
        const newChannel = localAction.channel
        const channelType = localAction.channelType
        updateMap = state.channels.value
        updateMapChannels = updateMap.channels
        if (channelType === 'instance') {
          const tempUpdateMapChannels = new Map()
          Object.entries(updateMapChannels).forEach(([key, value]) => {
            if (value.channelType !== 'instance') tempUpdateMapChannels[key] = value
          })
          updateMapChannels = new Map(tempUpdateMapChannels)
        }
        if (newChannel?.id != null && updateMapChannels[newChannel.id] == null) {
          newChannel.updateNeeded = true
          newChannel.limit = 10
          newChannel.skip = 0
          newChannel.total = 0
          updateMapChannels[newChannel.id] = newChannel
        }
        updateMap.channels = updateMapChannels
        returned = s.merge({ channels: updateMap })
        if (channelType === 'instance') {
          const channels = state.channels.value
          channels.fetchingInstanceChannel = false
          returned = s.merge({ instanceChannelFetched: true, channels: channels })
        }
        return returned
      case 'CREATED_MESSAGE':
        localAction = action
        const channelId = localAction.message.channelId
        const selfUser = localAction.selfUser
        updateMap = state.channels.value
        updateMapChannels = updateMap.channels
        updateMapChannelsChild = updateMapChannels[channelId]
        if (updateMapChannelsChild == null) {
          updateMap.updateNeeded = true
        } else {
          updateMapChannelsChild.messages =
            updateMapChannelsChild.messages == null ||
            updateMapChannelsChild.messages.size != null ||
            updateMapChannels.updateNeeded === true
              ? [localAction.message]
              : _.unionBy(updateMapChannelsChild.messages, [localAction.message], 'id')
          updateMapChannelsChild.skip = updateMapChannelsChild.skip + 1
          updateMapChannelsChild.updatedAt = moment().utc().toJSON()
          updateMapChannels[channelId] = updateMapChannelsChild
          updateMap.channels = updateMapChannels
        }
        returned = s.merge({ channels: updateMap, updateMessageScroll: true })

        if (state.targetChannelId.value.length === 0 && updateMapChannelsChild != null) {
          const channelType = updateMapChannelsChild.channelType
          const targetObject =
            channelType === 'user'
              ? updateMapChannelsChild.userId1 === selfUser.id
                ? updateMapChannelsChild.user2
                : updateMapChannelsChild.user1
              : channelType === 'group'
              ? updateMapChannelsChild.group
              : channelType === 'instance'
              ? updateMapChannelsChild.instance
              : updateMapChannelsChild.party
          returned = s.merge({ targetChannelId: channelId, targetObjectType: channelType, targetObject: targetObject })
        }
        return returned
      case 'LOADED_MESSAGES':
        localAction = action
        updateMap = state.channels.value
        updateMapChannels = updateMap.channels
        updateMapChannelsChild = updateMapChannels[localAction.channelId]
        updateMapChannelsChild.messages =
          updateMapChannelsChild.messages == null ||
          updateMapChannelsChild.messages.size != null ||
          updateMapChannels.updateNeeded === true
            ? localAction.messages
            : _.unionBy(updateMapChannelsChild.messages, localAction.messages, 'id')
        updateMapChannelsChild.limit = localAction.limit
        updateMapChannelsChild.skip = localAction.skip
        updateMapChannelsChild.total = localAction.total
        updateMapChannelsChild.updateNeeded = false
        updateMapChannels[localAction.channelId] = updateMapChannelsChild

        return s.channels.merge({ channels: updateMapChannels })
      case 'REMOVED_MESSAGE':
        localAction = action
        updateMap = state.channels.value

        updateMapChannels = updateMap.channels
        updateMapChannelsChild = updateMapChannels[localAction.message.channelId]
        if (updateMapChannelsChild != null) {
          _.remove(updateMapChannelsChild.messages, (message: Message) => message.id === localAction.message.id)
          updateMapChannelsChild.skip = updateMapChannelsChild.skip - 1
          updateMapChannels[localAction.message.channelId] = updateMapChannelsChild
          updateMap.channels = updateMapChannels
        }
        return s.merge({ channels: updateMap })
      case 'PATCHED_MESSAGE':
        localAction = action
        updateMap = state.channels.value

        updateMapChannels = updateMap.channels
        updateMapChannelsChild = updateMapChannels[localAction.message.channelId]
        if (updateMapChannelsChild != null) {
          updateMapChannelsChild.messages = updateMapChannelsChild.messages.map((message: Message) =>
            message.id === localAction.message.id ? localAction.message : message
          )

          updateMapChannels[localAction.message.channelId] = updateMapChannelsChild
          updateMap.channels = updateMapChannels
        }
        return state.merge({ channels: updateMap })
      case 'CREATED_CHANNEL':
        localAction = action
        const createdChannel = localAction.channel
        updateMap = state.channels.value
        updateMapChannels = updateMap.channels

        createdChannel.updateNeeded = true
        createdChannel.limit = 10
        createdChannel.skip = 0
        createdChannel.total = 0
        updateMapChannels[createdChannel.id] = createdChannel
        updateMap.channels = updateMapChannels
        return s.merge({ channels: updateMap })
      case 'PATCHED_CHANNEL':
        localAction = action
        const updateChannel = localAction.channel
        updateMap = state.channels.value

        updateMapChannels = updateMap.channels
        updateMapChannelsChild = updateMapChannels[localAction.channel.id]
        if (updateMapChannelsChild != null) {
          updateMapChannelsChild.updatedAt = updateChannel.updatedAt
          updateMapChannelsChild.group = updateChannel.group
          updateMapChannelsChild.instance = updateChannel.instance
          updateMapChannelsChild.party = updateChannel.party
          updateMapChannelsChild.user1 = updateChannel.user1
          updateMapChannelsChild.user2 = updateChannel.user2
          updateMapChannels[localAction.channel.id] = updateMapChannelsChild
          updateMap.channels = updateMapChannels
        }
        return s.merge({ channels: updateMap })
      case 'REMOVED_CHANNEL':
        localAction = action
        updateMap = state.channels.value
        updateMapChannels = updateMap.channels
        updateMapChannels.delete(localAction.channel.id)
        updateMap.channels = updateMapChannels
        return s.merge({ channels: updateMap })

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
export const useChatState = () => useState(state)
