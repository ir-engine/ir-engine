import Immutable from 'immutable'
import {
  LoadedMessagesAction,
  LoadedChannelAction,
  CreatedMessageAction,
  LoadedChannelsAction,
  RemovedMessageAction,
  ChatAction, ChatTargetSetAction
} from './actions'

import {
  CREATED_MESSAGE,
  LOADED_CHANNELS,
  LOADED_MESSAGES,
  LOADED_PARTY_CHANNEL,
  LOADED_GROUP_CHANNELS,
  LOADED_USER_CHANNELS,
  REMOVED_MESSAGE, CHAT_TARGET_SET
} from '../actions'

import { Message } from '../../../shared/interfaces/Message'

import _ from 'lodash'
import moment from 'moment'

export const initialState = {
  channels: {
    // user: {
    //   channels: {},
    //   limit: 50,
    //   skip: 0,
    //   total: 0,
    //   updateNeeded: true
    // },
    // group: {
    //   channels: {},
    //   limit: 50,
    //   skip: 0,
    //   total: 0,
    //   updateNeeded: true
    // },
    // party: {
    //   channel: {},
    //   updateNeeded: true
    // }
    channels: {},
    limit: 5,
    skip: 0,
    total: 0,
    updateNeeded: true,
  },
  targetObjectType: '',
  targetObject: {},
  updateMessageScroll: false
}

const immutableState = Immutable.fromJS(initialState)

const chatReducer = (state = immutableState, action: ChatAction): any => {
  let updateMap, localAction, updateMapChannels, updateMapChannelsType, updateMapChannelsTypeChildren, updateMapChannelsChild, setMap
  switch (action.type) {
    case LOADED_CHANNELS:
      localAction = (action as LoadedChannelsAction)
        console.log('LOADED CHANNELS')
        console.log('localAction: ')
        console.log(localAction)
      updateMap = new Map(state.get('channels'))
      updateMap.set('limit', localAction.limit)
      updateMap.set('skip', localAction.skip)
      updateMap.set('total', localAction.total)
      updateMapChannels = new Map((updateMap as any).get('channels'))
      updateMap.set('updateNeeded', false)
        console.log('updateMapChannels:')
        console.log(updateMapChannels)
      localAction.channels.forEach((channel) => {
        channel.updateNeeded = true
        channel.limit = 8
        channel.skip = 0
        channel.total = 0
        updateMapChannels.set(channel.id, channel)
        console.log(updateMapChannels)
      })
      updateMap.set('channels', updateMapChannels)
        console.log('LOADED CHANNELS updateMap:')
        console.log(updateMap)
      return state
          .set('channels', updateMap)
    case CREATED_MESSAGE:
      localAction = (action as CreatedMessageAction)
        const channelId = localAction.message.channelId
        console.log('CREATE MESSAGE LOCAL ACTION')
        console.log(localAction)
      updateMap = new Map(state.get('channels'))
        console.log(updateMap)
        updateMapChannels = new Map((updateMap as any).get('channels'))
        console.log(updateMapChannels)
        updateMapChannelsChild = (updateMapChannels as any).get(channelId)
        console.log('CREATE MESSAGE CHILD:')
        console.log(updateMapChannelsChild)
        if (updateMapChannelsChild == null) {
          updateMap.set('updateNeeded', true)
        }
        else {
          updateMapChannelsChild.messages = (updateMapChannelsChild.messages == null || updateMapChannelsChild.messages.size != null || updateMapChannels.get('updateNeeded') === true) ? localAction.message : _.unionBy(updateMapChannelsChild.messages, [localAction.message], 'id')
          updateMapChannelsChild.skip = updateMapChannelsChild.skip + 1
          updateMapChannelsChild.updatedAt = moment().utc().toJSON()
          updateMapChannels.set(channelId, updateMapChannelsChild)
          updateMap.set('channels', updateMapChannels)
        }
      console.log('CREATE MESSAGE UPDATEMAP:')
        console.log(updateMap)
      return state
          .set('channels', updateMap)
          .set('updateMessageScroll', true)
    case LOADED_MESSAGES:
      localAction = (action as LoadedMessagesAction)
        console.log('LOADED MESSAGES LOCAL ACTION')
        console.log(localAction)
      updateMap = new Map(state.get('channels'))
        updateMapChannels = updateMap.get('channels')
        updateMapChannelsChild = (updateMapChannels.get(localAction.channelId))
        updateMapChannelsChild.messages = (updateMapChannelsChild == null || updateMapChannelsChild.messages == null || updateMapChannelsChild.messages.size != null || updateMapChannels.get('updateNeeded') === true) ? localAction.messages : _.unionBy(updateMapChannelsChild.messages, localAction.messages, 'id')
        updateMapChannelsChild.limit = localAction.limit
        updateMapChannelsChild.skip = localAction.skip
        updateMapChannelsChild.total = localAction.total
        updateMapChannelsChild.updateNeeded = false
        updateMapChannels.set(localAction.channelId, updateMapChannelsChild)
        updateMap.set('channels', updateMapChannels)
      console.log(`LOADED MESSAGES FOR CHANNEL ${localAction.channelId}`)
      console.log(updateMap)
      return state
          .set('channels', updateMap)
    case REMOVED_MESSAGE:
      console.log('REMOVED MESSAGE REDUCER')
      localAction = (action as RemovedMessageAction)
        console.log(localAction)
      updateMap = new Map(state.get('channels'))

        updateMapChannels = new Map(updateMap.get('channels'))
        updateMapChannelsChild = (updateMapChannels as any).get(localAction.channelId)
        console.log('OLD MESSAGES:')
        console.log(updateMapChannelsChild.messages)
        updateMapChannelsChild.messages = _.remove(updateMapChannelsChild.messages, (message: Message) => message.id === localAction.messageId)
        console.log('NEW MESSAGES:')
        console.log(updateMapChannelsChild.messages)
        updateMapChannelsChild.skip = updateMapChannelsChild.skip - 1
        updateMapChannels.set(localAction.channelId, updateMapChannelsChild)
        updateMap.set('channels', updateMapChannels)
      console.log('REMOVED MESSAGE')
      console.log(updateMap)
      return state
          .set('channels', updateMap)

    case CHAT_TARGET_SET:
      console.log('CHAT_TARGET_SET REDUCER')
      const { targetObjectType, targetObject } = (action as ChatTargetSetAction)
        console.log(targetObjectType)
        console.log(targetObject)
      return state
          .set('targetObjectType', targetObjectType)
          .set('targetObject', targetObject)
  }

  return state
}

export default chatReducer
