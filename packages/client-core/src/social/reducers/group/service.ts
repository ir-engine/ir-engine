import { Config } from '@xrengine/common/src/config'
import { Dispatch } from 'redux'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { client } from '../../../feathers'
import Store from '../../../store'
import {
  createdGroup,
  createdGroupUser,
  fetchingGroups,
  fetchingInvitableGroups,
  loadedGroups,
  loadedInvitableGroups,
  patchedGroup,
  patchedGroupUser,
  removedGroup,
  removedGroupUser
} from './actions'
import { UserAction } from '../../../user/store/UserAction'
import { useAuthState } from '../../../user/reducers/auth/AuthState'
const store = Store.store

export function getGroups(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingGroups())
    try {
      const groupResults = await client.service('group').find({
        query: {
          $limit: limit != null ? limit : getState().get('groups').get('groups').get('limit'),
          $skip: skip != null ? skip : getState().get('groups').get('groups').get('skip')
        }
      })
      dispatch(loadedGroups(groupResults))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createGroup(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('group').create({
        name: values.name,
        description: values.description
      })
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function patchGroup(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    const patch = {}
    if (values.name != null) {
      ;(patch as any).name = values.name
    }
    if (values.description != null) {
      ;(patch as any).description = values.description
    }
    try {
      await client.service('group').patch(values.id, patch)
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeGroup(groupId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const channelResult = (await client.service('channel').find({
        query: {
          groupId: groupId
        }
      })) as any
      if (channelResult.total > 0) {
        await client.service('channel').remove(channelResult.data[0].id)
      }
      await client.service('group').remove(groupId)
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeGroupUser(groupUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('group-user').remove(groupUserId)
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getInvitableGroups(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingInvitableGroups())
    try {
      const groupResults = await client.service('group').find({
        query: {
          invitable: true,
          $limit: limit != null ? limit : getState().get('groups').get('groups').get('limit'),
          $skip: skip != null ? skip : getState().get('groups').get('groups').get('skip')
        }
      })
      dispatch(loadedInvitableGroups(groupResults))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
      dispatch(loadedInvitableGroups({ data: [], limit: 0, skip: 0, total: 0 }))
    }
  }
}
if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('group-user').on('created', (params) => {
    const newGroupUser = params.groupUser
    const selfUser = useAuthState().user
    store.dispatch(createdGroupUser(newGroupUser))
    if (
      newGroupUser.user.channelInstanceId != null &&
      newGroupUser.user.channelInstanceId === selfUser.channelInstanceId.value
    )
      store.dispatch(UserAction.addedChannelLayerUser(newGroupUser.user))
    if (newGroupUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
      store.dispatch(UserAction.removedChannelLayerUser(newGroupUser.user))
  })

  client.service('group-user').on('patched', (params) => {
    const updatedGroupUser = params.groupUser
    const selfUser = useAuthState().user
    store.dispatch(patchedGroupUser(updatedGroupUser))
    if (
      updatedGroupUser.user.channelInstanceId != null &&
      updatedGroupUser.user.channelInstanceId === selfUser.channelInstanceId.value
    )
      store.dispatch(UserAction.addedChannelLayerUser(updatedGroupUser.user))
    if (updatedGroupUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
      store.dispatch(UserAction.removedChannelLayerUser(updatedGroupUser.user))
  })

  client.service('group-user').on('removed', (params) => {
    const deletedGroupUser = params.groupUser
    const selfUser = useAuthState().user
    store.dispatch(removedGroupUser(deletedGroupUser, params.self))
    if (
      deletedGroupUser.user.channelInstanceId != null &&
      deletedGroupUser.user.channelInstanceId === selfUser.channelInstanceId.value
    )
      store.dispatch(UserAction.addedChannelLayerUser(deletedGroupUser.user))
    if (deletedGroupUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
      store.dispatch(UserAction.removedChannelLayerUser(deletedGroupUser.user))
  })

  client.service('group').on('created', (params) => {
    store.dispatch(createdGroup(params.group))
  })

  client.service('group').on('patched', (params) => {
    store.dispatch(patchedGroup(params.group))
  })

  client.service('group').on('removed', (params) => {
    store.dispatch(removedGroup(params.group))
  })

  client.service('group').on('refresh', (params) => {
    store.dispatch(createdGroup(params.group))
  })
}
