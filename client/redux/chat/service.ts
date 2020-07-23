import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  createdMessage,
  loadedGroupChannels,
  loadedMessages,
  loadedPartyChannel,
  loadedUserChannels,
  removedMessage
} from './actions'

import store from '../store'

export function getUserChannels(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const channelResult = await client.service('channel').find({
      query: {
        channelType: 'user',
        $limit: limit != null ? limit: getState().get('chat').get('channels').get('user').get('limit'),
        $skip: skip != null ? skip: getState().get('chat').get('channels').get('user').get('skip')
      }
    })
    dispatch(loadedUserChannels(channelResult))
  }
}

export function getGroupChannels(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const channelResult = await client.service('channel').find({
      query: {
        channelType: 'group',
        $limit: limit != null ? limit: getState().get('chat').get('channels').get('group').get('limit'),
        $skip: skip != null ? skip: getState().get('chat').get('channels').get('group').get('skip')
      }
    })
    dispatch(loadedGroupChannels(channelResult))
  }
}

export function getPartyChannel() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const channelResult = await client.service('channel').find({
      query: {
        channelType: 'party'
      }
    })
    dispatch(loadedPartyChannel(channelResult))
  }
}

export function createMessage(values: any) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const newMessage = await client.service('message').create({
      targetObjectId: values.targetObjectId,
      targetObjectType: values.targetObjectType,
      text: values.text
    })
    dispatch(createdMessage(values.targetObjectType, newMessage))
  }
}

export function getChannelMessages(channelId: string, channelType: string, skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    console.log(`GETTING CHANNEL MESSAGES FOR CHANNEL ${channelId} OF TYPE ${channelType}`)
    console.log(getState().get('chat').get('channels').get(channelType).get('channels').get(channelId))
    const messageResult = await client.service('message').find({
      query: {
        channelId: channelId,
        $limit: limit != null ? limit: getState().get('chat').get('channels').get(channelType).get('channels').get(channelId).limit,
        $skip: skip != null ? skip: getState().get('chat').get('channels').get(channelType).get('channels').get(channelId).skip
      }
    })
    console.log(`GOT MESSAGES FOR CHANNEL ${channelId} OF TYPE ${channelType}`)
    console.log(messageResult)
    dispatch(loadedMessages(channelType, channelId, messageResult))
  }
}


export function removeMessage(messageId: string, channelType: string, channelId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('message').remove(messageId)
    console.log(`REMOVED MESSAGE ${messageId} FROM CHANNEL ${channelId} OF TYPE ${channelType}`)
    dispatch(removedMessage(channelType, channelId))
  }
}

client.service('message').on('created', (params) => {
  console.log('MESSAGE CREATED EVENT')
  console.log(params)
  store.dispatch(createdMessage(params.channelType, params.message))
})