import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedGroupUsers,
  loadedSelfGroupUser,
  removedGroupUser,
  fetchingGroupUsers,
  fetchingSelfGroupUser
} from './actions'

export function getGroupUsers(groupId: string, skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingGroupUsers())
    const groupUserResults = await client.service('group-user').find({
      query: {
        groupId: groupId,
        $limit: limit != null ? limit : getState().get('groupUsers').get('groupUsers').get('limit'),
        $skip: skip != null ? skip : getState().get('groupUsers').get('groupUsers').get('skip'),
      }
    })
    dispatch(loadedGroupUsers(groupUserResults))
  }
}

export function getSelfGroupUser(groupId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingSelfGroupUser())
    const selfGroupUserResults = await client.service('group-user').find({
      query: {
        groupId: groupId,
        userId: getState().get('auth').get('user').id
      }
    })
    console.log('GOT SELF GROUP USER:')
    console.log(selfGroupUserResults.data)
    dispatch(loadedSelfGroupUser(selfGroupUserResults))
  }
}

export function removeGroupUser(groupUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('group-user').remove(groupUserId)
    dispatch(removedGroupUser())
  }
}
