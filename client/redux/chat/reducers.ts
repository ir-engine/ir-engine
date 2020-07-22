import Immutable from 'immutable'
import {
  LoadedMessagesAction,
  LoadedChannelAction,
  CreatedMessageAction,
  LoadedChannelsAction,
  RemovedMessageAction,
  ChatAction
} from './actions'

import _ from 'lodash'

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
      limit: 0,
      skip: 0,
      total: 0,
      updateNeeded: true
    },
    group: {
      channels: {},
      limit: 0,
      skip: 0,
      total: 0,
      updateNeeded: true
    },
    party: {
      channel: {},
      limit: 0,
      skip: 0,
      total: 0,
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
        console.log('INITIAL STATE')
        console.log(state)
      updateMap = new Map(state.get('channels'))
        console.log('Are maps the same?')
        console.log(state.get('channels') === updateMap)
        console.log('intitial updateMap:')
        console.log(updateMap)
        updateMap.set('user', new Map())
        console.log('UPDATED UPDATE MAP')
        console.log(updateMap)
      const updateMapUserChannels = (updateMap as any).get('user')
        console.log('updateMapUserChannels:')
        console.log(updateMapUserChannels)
      updateMapUserChannels.set('limit', localAction.limit)
      updateMapUserChannels.set('skip', localAction.skip)
      updateMapUserChannels.set('total', localAction.total)
        console.log('new pagination values:')
        console.log(updateMapUserChannels.get('updateNeeded'))
      const updateMapUserChannelsChildren = (updateMapUserChannels as any).get('channels')
      updateMapUserChannels.set('updateNeeded', false)
        console.log(updateMapUserChannels.get('updateNeeded'))
        console.log(updateMapUserChannels)
        console.log('localAction:')
        console.log(localAction)
      localAction.channels.forEach((userChannel) => {
        userChannel.messageUpdateNeeded = true
        updateMapUserChannelsChildren.set(userChannel.id, userChannel)
      })
        console.log('GOT USER CHANNELS')
        console.log(updateMap)
      return state
        .set('channels', updateMap)
    case LOADED_GROUP_CHANNELS:
      localAction = (action as LoadedChannelsAction)
      updateMap = new Map(state.get('channels'))
      const updateMapGroupChannels = (updateMap as any).get('group')
      updateMapGroupChannels.set('limit', localAction.limit)
      updateMapGroupChannels.set('skip', localAction.skip)
      updateMapGroupChannels.set('total', localAction.total)
      const updateMapGroupChannelsChildren = (updateMapGroupChannels as any).get('channels')
      updateMapGroupChannels.set('updateNeeded', false)
      localAction.channels.forEach((groupChannel) => {
        groupChannel.updateNeeded = true
        // setMap = new Map()
        // setMap.set('messages', [])
        // setMap.set('updateNeeded', true)
        updateMapGroupChannelsChildren.set(groupChannel.id, groupChannel)
      })
      console.log('GOT GROUP CHANNELS')
      console.log(updateMap)
      return state
        .set('channels', updateMap)
    case LOADED_PARTY_CHANNEL:
      localAction = (action as LoadedChannelAction)
      updateMap = new Map(state.get('channels'))
      const updateMapPartyChannel = (updateMap as any).get('party')
      const updateMapPartyChannelChild = (updateMapPartyChannel as any).get('channel')
      updateMapPartyChannel.set('updateNeeded', false)
      updateMapPartyChannelChild.set(localAction.channel)
      console.log('GOT PARTY CHANNEL')
      console.log(updateMap)
      return state
        .set('channels', updateMap)
    case CREATED_MESSAGE:
      localAction = (action as CreatedMessageAction)
      updateMap = new Map(state.get('channels'))
      updateMapChannelsType = (updateMap as any).get(localAction.channelType)
      updateMapChannelsTypeChildren = (updateMapChannelsType as any).get('channels')
      updateMapChannelsTypeChild = (updateMapChannelsTypeChildren as any).get(localAction.channelId)
      if (updateMapChannelsTypeChild == null) {
       updateMapChannelsType.set('updateNeeded', true)
      }
      else {
        updateMapChannelsTypeChild.set('updateNeeded', true)
      }
      console.log('CREATED MESSAGE')
      console.log(updateMap)
      return state
          .set('channels', updateMap)
    case LOADED_MESSAGES:
      localAction = (action as LoadedMessagesAction)
      updateMap = new Map(state.get('channels'))
      updateMapChannelsType = (updateMap as any).get(localAction.channelType)
      updateMapChannelsTypeChildren = (updateMapChannelsType as any).get('channels')
      updateMapChannelsTypeChild = (updateMapChannelsTypeChildren as any).get(localAction.channelId)
      updateMapChannelsTypeChild.set('messages', localAction.messages)
      updateMapChannelsTypeChild.set('limit', localAction.limit)
      updateMapChannelsTypeChild.set('skip', localAction.skip)
      updateMapChannelsTypeChild.set('total', localAction.total)
      updateMapChannelsTypeChild.set('updateNeeded', false)

      console.log(`LOADED MESSAGES FOR CHANNEL ${localAction.channelId}`)
      console.log(updateMap)
      return state
          .set('channels', updateMap)
    case REMOVED_MESSAGE:
      localAction = (action as RemovedMessageAction)
      updateMap = new Map(state.get('channels'))
      updateMapChannelsType = (updateMap as any).get(localAction.channelType)
      updateMapChannelsTypeChildren = (updateMapChannelsType as any).get('channels')
      updateMapChannelsTypeChild = (updateMapChannelsTypeChildren as any).get(localAction.channelId)
      updateMapChannelsTypeChild.set('updateNeeded', true)
      console.log('REMOVED MESSAGE')
      console.log(updateMap)
      return state
          .set('channels', updateMap)
  }

  return state
}

export default chatReducer
