import Immutable from 'immutable'
import {
  LoadedMessagesAction,
  LoadedChannelAction,
  CreatedMessageAction,
  LoadedChannelsAction,
  RemovedMessageAction,
  ChatAction
} from './actions'

import {
  CREATED_MESSAGE,
  LOADED_MESSAGES,
  LOADED_PARTY_CHANNEL,
  LOADED_GROUP_CHANNELS,
  LOADED_USER_CHANNELS,
  REMOVED_MESSAGE
} from '../actions'

export const initialState = {
  channels: {
    user: {
      channels: {},
      limit: 50,
      skip: 0,
      total: 0,
      updateNeeded: true
    },
    group: {
      channels: {},
      limit: 50,
      skip: 0,
      total: 0,
      updateNeeded: true
    },
    party: {
      channel: {},
      updateNeeded: true
    }
  }
}

const immutableState = Immutable.fromJS(initialState)

const chatReducer = (state = immutableState, action: ChatAction): any => {
  let updateMap, localAction, updateMapChannels, updateMapChannelsType, updateMapChannelsTypeChildren, updateMapChannelsTypeChild, setMap
  switch (action.type) {
    case LOADED_USER_CHANNELS:
      localAction = (action as LoadedChannelsAction)
      updateMap = new Map(state.get('channels'))
      const updateMapUserChannels = new Map((updateMap as any).get('user'))
      updateMapUserChannels.set('limit', localAction.limit)
      updateMapUserChannels.set('skip', localAction.skip)
      updateMapUserChannels.set('total', localAction.total)
      const updateMapUserChannelsChildren = new Map((updateMapUserChannels as any).get('channels'))
      updateMapUserChannels.set('updateNeeded', false)
      localAction.channels.forEach((userChannel) => {
        userChannel.updateNeeded = true
        userChannel.limit = 50
        userChannel.skip = 0
        userChannel.total = 0
        updateMapUserChannelsChildren.set(userChannel.id, userChannel)
      })
      updateMapUserChannels.set('channels', updateMapUserChannelsChildren)
      updateMap.set('user', updateMapUserChannels)
      return state
        .set('channels', updateMap)
    case LOADED_GROUP_CHANNELS:
      localAction = (action as LoadedChannelsAction)
      updateMap = new Map(state.get('channels'))
      const updateMapGroupChannels = new Map((updateMap as any).get('group'))
      updateMapGroupChannels.set('limit', localAction.limit)
      updateMapGroupChannels.set('skip', localAction.skip)
      updateMapGroupChannels.set('total', localAction.total)
      const updateMapGroupChannelsChildren = new Map((updateMapGroupChannels as any).get('channels'))
      updateMapGroupChannels.set('updateNeeded', false)
      localAction.channels.forEach((groupChannel) => {
        groupChannel.updateNeeded = true
        groupChannel.limit = 50
        groupChannel.skip = 0
        groupChannel.total = 0
        updateMapGroupChannelsChildren.set(groupChannel.id, groupChannel)
      })
      updateMapGroupChannels.set('channels', updateMapGroupChannelsChildren)
      updateMap.set('group', updateMapGroupChannels)
      return state
        .set('channels', updateMap)
    case LOADED_PARTY_CHANNEL:
      localAction = (action as LoadedChannelAction)
      updateMap = new Map(state.get('channels'))
      const updateMapPartyChannel = new Map((updateMap as any).get('party'))
      updateMapPartyChannel.set('updateNeeded', false)
      updateMapPartyChannel.set('limit', 50)
      updateMapPartyChannel.set('skip', 0)
      updateMapPartyChannel.set('total', 0)
      updateMapPartyChannel.set('channel', localAction.channel)
      updateMap.set('party', updateMapPartyChannel)
      return state
        .set('channels', updateMap)
    case CREATED_MESSAGE:
      localAction = (action as CreatedMessageAction)
        console.log('CREATE MESSAGE LOCAL ACTION')
        console.log(localAction)
      updateMap = new Map(state.get('channels'))
      updateMapChannelsType = new Map((updateMap as any).get(localAction.channelType))
        console.log(updateMapChannelsType)
      if (localAction.channelType === 'party') {
        updateMapChannelsType.set('updateNeeded', true)
        updateMap.set(localAction.channelType, updateMapChannelsType)
      }
      else {
        updateMapChannelsTypeChildren = new Map((updateMapChannelsType as any).get('channels'))
        console.log(updateMapChannelsTypeChildren)
        updateMapChannelsTypeChild = (updateMapChannelsTypeChildren as any).get(localAction.channelId)
        console.log('CREATE MESSAGE TYPECHILD:')
        console.log(updateMapChannelsTypeChild)
        if (updateMapChannelsTypeChild == null) {
          updateMapChannelsType.updateNeeded = true
          updateMap.set(localAction.channelType, updateMapChannelsType)
        }
        else {
          updateMapChannelsTypeChild.updateNeeded = true
          updateMapChannelsTypeChildren.set(localAction.channelId, updateMapChannelsTypeChild)
          updateMapChannelsType.set('channels', updateMapChannelsTypeChildren)
          updateMap.set(localAction.channelType, updateMapChannelsType)
        }
      }
      console.log('CREATE MESSAGE UPDATEMAP:')
        console.log(updateMap)
      return state
          .set('channels', updateMap)
    case LOADED_MESSAGES:
      localAction = (action as LoadedMessagesAction)
        console.log('LOADED MESSAGES LOCAL ACTION')
        console.log(localAction)
      updateMap = new Map(state.get('channels'))
      updateMapChannelsType = new Map((updateMap as any).get(localAction.channelType))
      if (localAction.channelType === 'party') {
       updateMapChannelsTypeChild = new Map((updateMapChannelsType as any).channel)
        updateMapChannelsTypeChild.messages = localAction.messages
        updateMapChannelsTypeChild.limit = localAction.limit
        updateMapChannelsTypeChild.skip = localAction.skip
        updateMapChannelsTypeChild.total = localAction.total
        updateMapChannelsTypeChild.updateNeeded = false
        updateMapChannelsType.set('channels', updateMapChannelsTypeChild)
        updateMap.set(localAction.channelType, updateMapChannelsType)
      }
      else {
        console.log(updateMapChannelsType)
        console.log(updateMapChannelsType.get('channels'))
        console.log(updateMapChannelsType.get('channels').get(localAction.channelId))
        updateMapChannelsTypeChildren = new Map((updateMapChannelsType as any).get('channels'))
        updateMapChannelsTypeChild = (updateMapChannelsTypeChildren as any).get(localAction.channelId)
        updateMapChannelsTypeChild.messages =  localAction.messages
        updateMapChannelsTypeChild.limit = localAction.limit
        updateMapChannelsTypeChild.skip = localAction.skip
        updateMapChannelsTypeChild.total = localAction.total
        updateMapChannelsTypeChild.updateNeeded = false
        updateMapChannelsTypeChildren.set(localAction.channelId, updateMapChannelsTypeChild)
        updateMapChannelsType.set('channels', updateMapChannelsTypeChildren)
        updateMap.set(localAction.channelType, updateMapChannelsType)
      }
      console.log(`LOADED MESSAGES FOR CHANNEL ${localAction.channelId}`)
      console.log(updateMap)
      return state
          .set('channels', updateMap)
    case REMOVED_MESSAGE:
      localAction = (action as RemovedMessageAction)
      updateMap = new Map(state.get('channels'))
      updateMapChannelsType = new Map((updateMap as any).get(localAction.channelType))
      if (localAction.channelType === 'party') {
        updateMapChannelsTypeChild = (updateMapChannelsType as any).channel
        updateMapChannelsTypeChild.updateNeeded = true
        updateMapChannelsType.set('channel', updateMapChannelsTypeChild)
        updateMap.set(localAction.channelType, updateMapChannelsType)
      }
      else {
        updateMapChannelsTypeChildren = new Map((updateMapChannelsType as any).get('channels'))
        updateMapChannelsTypeChild = (updateMapChannelsTypeChildren as any).get(localAction.channelId)
        updateMapChannelsTypeChild.updateNeeded = true
        updateMapChannelsTypeChildren.set(localAction.channelId, updateMapChannelsTypeChild)
        updateMapChannelsType.set('channels', updateMapChannelsTypeChildren)
        updateMap.set(localAction.channelType, updateMapChannelsType)
      }
      console.log('REMOVED MESSAGE')
      console.log(updateMap)
      return state
          .set('channels', updateMap)
  }

  return state
}

export default chatReducer
