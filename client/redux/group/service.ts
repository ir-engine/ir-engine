import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedGroups,
  addedGroup,
  patchedGroup,
  removedGroup,
  removedGroupUser,
  leftGroup,
  fetchingGroups,
  loadedInvitableGroups,
  fetchingInvitableGroups
} from './actions'

export function getGroups(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingGroups())
    const groupResults = await client.service('group').find({
      query: {
        $limit: limit != null ? limit : getState().get('groups').get('groups').get('limit'),
        $skip: skip != null ? skip : getState().get('groups').get('groups').get('skip'),
      }
    })
    console.log('GROUP RESULT:')
    console.log(groupResults)
    dispatch(loadedGroups(groupResults))
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

export function getInvitableGroups(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    console.log('Dispatching fetchingInvitableGroups')
    dispatch(fetchingInvitableGroups())
    console.log('GETTING INVITABLE GROUPS')
    const groupResults = await client.service('group').find({
      query: {
        invitable: true,
        $limit: limit != null ? limit : getState().get('groups').get('groups').get('limit'),
        $skip: skip != null ? skip : getState().get('groups').get('groups').get('skip'),
      }
    })
    console.log('INVITABLE GROUP RESULT:')
    console.log(groupResults)
    dispatch(loadedInvitableGroups(groupResults))
  }
}