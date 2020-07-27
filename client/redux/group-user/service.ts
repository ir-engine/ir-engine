import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedGroupUsers,
  loadedSelfGroupUser,
  removedGroupUser,
  fetchingGroupUsers,
  fetchingSelfGroupUser
} from './actions'
import {dispatchAlertError} from "../alert/service";

export function getGroupUsers(groupId: string, skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingGroupUsers())
    try {
      const groupUserResults = await client.service('group-user').find({
        query: {
          groupId: groupId,
          $limit: limit != null ? limit : getState().get('groupUsers').get('groupUsers').get('limit'),
          $skip: skip != null ? skip : getState().get('groupUsers').get('groupUsers').get('skip'),
        }
      })
      dispatch(loadedGroupUsers(groupUserResults))
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
      dispatch(loadedGroupUsers({ data: [], limit: 0, skip: 0, total: 0 }))
    }
  }
}

export function getSelfGroupUser(groupId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingSelfGroupUser())
    try {
      const selfGroupUserResults = await client.service('group-user').find({
        query: {
          groupId: groupId,
          userId: getState().get('auth').get('user').id
        }
      })
      console.log('GOT SELF GROUP USER:')
      console.log(selfGroupUserResults.data)
      dispatch(loadedSelfGroupUser(selfGroupUserResults))
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
      dispatch(loadedSelfGroupUser({ data: [], limit: 0, skip: 0, total: 0 }))
    }
  }
}

export function removeGroupUser(groupUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('group-user').remove(groupUserId)
      dispatch(removedGroupUser())
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}
