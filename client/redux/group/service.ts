import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedGroups,
  addedGroup,
  patchedGroup,
  removedGroup,
  removedGroupUser,
  leftGroup
} from './actions'
import { User } from '../../../shared/interfaces/User'

export function getGroups(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const groupResults = await client.service('group').find({
      query: {
        $limit: limit != null ? limit : getState().get('groups').get('groups').get('limit'),
        $skip: skip != null ? skip : getState().get('groups').get('groups').get('skip'),
      }
    })
    dispatch(loadedGroups(groupResults))
  }
}

export function leaveGroup(groupId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('group-user').remove(groupId)
    dispatch(leftGroup())
  }
}

export function createGroup(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('group').create({
      name: values.name,
      description: values.description
    })
    dispatch(addedGroup())
  }
}

export function patchGroup(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    let patch = {}
    if (values.name != null) {
      (patch as any).name = values.name
    }
    if (values.description != null) {
      (patch as any).description = values.description
    }
    console.log('UPDATE GROUP VALUES:')
    console.log(values)
    await client.service('group').patch(values.id, patch)
    dispatch(patchedGroup())
  }
}

export function removeGroup(groupId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('group').remove(groupId)
    dispatch(removedGroup())
  }
}

export function removeGroupUser(groupUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('group-user').remove(groupUserId)
    dispatch(removedGroupUser())
  }
}
