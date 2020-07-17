import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedGroupUsers,
  loadedSelfGroupUser,
  removedGroupUser
} from './actions'

export function getGroupUsers(groupId: string, skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const groupUserResults = await client.service('group-user').find({
      query: {
        groupId: groupId,
        $limit: limit != null ? limit : getState().get('groups').get('groups').get('limit'),
        $skip: skip != null ? skip : getState().get('groups').get('groups').get('skip'),
      }
    })
    dispatch(loadedGroupUsers(groupUserResults))
  }
}

export function getSelfGroupUser(groupId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    console.log('getSelfGroupUser')
    console.log('groupId: ' + groupId)
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
