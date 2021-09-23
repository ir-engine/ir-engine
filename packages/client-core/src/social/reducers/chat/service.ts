import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import {
  createdMessage,
  loadedChannel,
  loadedChannels,
  loadedMessages,
  patchedMessage,
  removedMessage,
  setChatTarget,
  setMessageScrollInit,
  createdChannel,
  patchedChannel,
  removedChannel
} from './actions'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

import { User } from '@xrengine/common/src/interfaces/User'
import Store from '../../../store'
import { dispatchAlertError } from '../../../common/reducers/alert/AlertService'

import { Config } from '@xrengine/common/src/config'

import { accessAuthState } from '../../../user/reducers/auth/AuthState'

const store = Store.store

export function getChannels(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      await waitForClientAuthenticated()
      const channelResult = await client.service('channel').find({
        query: {
          $limit: limit != null ? limit : getState().get('chat').get('channels').get('channels').get('limit'),
          $skip: skip != null ? skip : getState().get('chat').get('channels').get('channels').get('skip')
        }
      })
      dispatch(loadedChannels(channelResult))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getInstanceChannel() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const channelResult = await client.service('channel').find({
        query: {
          channelType: 'instance'
        }
      })
      dispatch(loadedChannel(channelResult.data[0], 'instance'))
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createMessage(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('message').create({
        targetObjectId: values.targetObjectId,
        targetObjectType: values.targetObjectType,
        text: values.text
      })
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export async function sendChatMessage(values: any) {
  try {
    await client.service('message').create({
      targetObjectId: values.targetObjectId,
      targetObjectType: values.targetObjectType,
      text: values.text
    })
  } catch (err) {
    console.log(err)
  }
}

//sends a chat message in the current channel
export async function sendMessage(text: string) {
  const user = accessAuthState().user.value
  await sendChatMessage({
    targetObjectId: user.instanceId,
    targetObjectType: 'instance',
    text: text
  })
}

export function getChannelMessages(channelId: string, skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const messageResult = await client.service('message').find({
        query: {
          channelId: channelId,
          $sort: {
            createdAt: -1
          },
          $limit: limit != null ? limit : getState().get('chat').get('channels').get('channels').get(channelId).limit,
          $skip: skip != null ? skip : getState().get('chat').get('channels').get('channels').get(channelId).skip
        }
      })
      dispatch(loadedMessages(channelId, messageResult))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeMessage(messageId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('message').remove(messageId)
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function patchMessage(messageId: string, text: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('message').patch(messageId, {
        text: text
      })
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateChatTarget(targetObjectType: string, targetObject: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    const targetChannelResult = await client.service('channel').find({
      query: {
        findTargetId: true,
        targetObjectType: targetObjectType,
        targetObjectId: targetObject.id
      }
    })
    dispatch(
      setChatTarget(targetObjectType, targetObject, targetChannelResult.total > 0 ? targetChannelResult.data[0].id : '')
    )
  }
}

export function updateMessageScrollInit(value: boolean) {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(setMessageScrollInit(value))
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('message').on('created', (params) => {
    const selfUser = accessAuthState().user.value
    const msg = createdMessage(params.message, selfUser)
    if (msg != undefined) store.dispatch(msg)
  })

  client.service('message').on('patched', (params) => {
    store.dispatch(patchedMessage(params.message))
  })

  client.service('message').on('removed', (params) => {
    store.dispatch(removedMessage(params.message))
  })

  client.service('channel').on('created', (params) => {
    store.dispatch(createdChannel(params.channel))
  })

  client.service('channel').on('patched', (params) => {
    store.dispatch(patchedChannel(params.channel))
  })

  client.service('channel').on('removed', (params) => {
    store.dispatch(removedChannel(params.channel))
  })
}
