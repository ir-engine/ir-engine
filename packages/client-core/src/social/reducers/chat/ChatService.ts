import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { ChatAction } from './ChatActions'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

import Store from '../../../store'
import { AlertService } from '../../../common/reducers/alert/AlertService'

import { Config } from '@xrengine/common/src/config'

import { accessAuthState } from '../../../user/reducers/auth/AuthState'

import { accessChatState } from './ChatState'

const store = Store.store

export const ChatService = {
  getChannels: (skip?: number, limit?: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        await waitForClientAuthenticated()
        const chatState = accessChatState().value

        const channelResult = await client.service('channel').find({
          query: {
            $limit: limit != null ? limit : chatState.channels.limit,
            $skip: skip != null ? skip : chatState.channels.skip
          }
        })
        dispatch(ChatAction.loadedChannels(channelResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getInstanceChannel: () => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const channelResult = await client.service('channel').find({
          query: {
            channelType: 'instance'
          }
        })
        dispatch(ChatAction.loadedChannel(channelResult.data[0], 'instance'))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  createMessage: (values: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const data = {
          targetObjectId: values.targetObjectId,
          targetObjectType: values.targetObjectType,
          text: values.text
        }
        console.log(data)
        await client.service('message').create(data)
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  sendChatMessage: (values: any) => {
    try {
      client.service('message').create({
        targetObjectId: values.targetObjectId,
        targetObjectType: values.targetObjectType,
        text: values.text
      })
    } catch (err) {
      console.log(err)
    }
  },
  sendMessage: (text: string) => {
    const user = accessAuthState().user.value
    ChatService.sendChatMessage({
      targetObjectId: user.instanceId,
      targetObjectType: 'instance',
      text: text
    })
  },
  getChannelMessages: (channelId: string, skip?: number, limit?: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const chatState = accessChatState().value
        const messageResult = await client.service('message').find({
          query: {
            channelId: channelId,
            $sort: {
              createdAt: -1
            },
            $limit: limit != null ? limit : chatState.channels.channels[channelId].limit,
            $skip: skip != null ? skip : chatState.channels.channels[channelId].skip
          }
        })
        dispatch(ChatAction.loadedMessages(channelId, messageResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeMessage: (messageId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('message').remove(messageId)
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  patchMessage: (messageId: string, text: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('message').patch(messageId, {
          text: text
        })
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateChatTarget: (targetObjectType: string, targetObject: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      const targetChannelResult = await client.service('channel').find({
        query: {
          findTargetId: true,
          targetObjectType: targetObjectType,
          targetObjectId: targetObject.id
        }
      })
      dispatch(
        ChatAction.setChatTarget(
          targetObjectType,
          targetObject,
          targetChannelResult.total > 0 ? targetChannelResult.data[0].id : ''
        )
      )
    }
  },
  clearChatTargetIfCurrent: (targetObjectType: string, targetObject: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      const chatState = accessChatState().value
      const chatStateTargetObjectType = chatState.targetObjectType
      const chatStateTargetObjectId = chatState.targetObject.id
      if (
        targetObjectType === chatStateTargetObjectType &&
        (targetObject.id === chatStateTargetObjectId ||
          targetObject.relatedUserId === chatStateTargetObjectId ||
          targetObject.userId === chatStateTargetObjectId)
      ) {
        dispatch(ChatAction.setChatTarget('', {}, ''))
      }
    }
  },
  updateMessageScrollInit: (value: boolean) => {
    return async (dispatch: Dispatch): Promise<any> => {
      dispatch(ChatAction.setMessageScrollInit(value))
    }
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('message').on('created', (params) => {
    const selfUser = accessAuthState().user.value
    const msg = ChatAction.createdMessage(params.message, selfUser)
    if (msg != undefined) store.dispatch(msg)
  })

  client.service('message').on('patched', (params) => {
    store.dispatch(ChatAction.patchedMessage(params.message))
  })

  client.service('message').on('removed', (params) => {
    store.dispatch(ChatAction.removedMessage(params.message))
  })

  client.service('channel').on('created', (params) => {
    store.dispatch(ChatAction.createdChannel(params.channel))
  })

  client.service('channel').on('patched', (params) => {
    store.dispatch(ChatAction.patchedChannel(params.channel))
  })

  client.service('channel').on('removed', (params) => {
    store.dispatch(ChatAction.removedChannel(params.channel))
  })
}
