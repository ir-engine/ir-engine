import Immutable from 'immutable'
import {
  GroupAction,
  LoadedGroupsAction,
  CreatedGroupUserAction,
  PatchedGroupUserAction,
  RemovedGroupUserAction
} from './actions'

import {
  LOADED_GROUPS,
  ADDED_GROUP,
  PATCHED_GROUP,
  REMOVED_GROUP,
  INVITED_GROUP_USER,
  REMOVED_GROUP_USER,
  LEFT_GROUP,
  FETCHING_GROUPS,
  LOADED_INVITABLE_GROUPS,
  FETCHING_INVITABLE_GROUPS,
  CREATED_GROUP_USER,
  PATCHED_GROUP_USER
} from '../actions'

import _ from 'lodash'
import {GroupUser} from "../../../shared/interfaces/GroupUser";

export const initialState = {
  groups: {
    groups: [],
    total: 0,
    limit: 5,
    skip: 0
  },
  invitableGroups: {
    groups: [],
    total: 0,
    limit: 5,
    skip: 0
  },
  getInvitableGroupsInProgress: false,
  getGroupsInProgress: false,
  invitableUpdateNeeded: true,
  updateNeeded: true,
  selfGroupUser: null,
  selfUpdateNeeded: false,
  getSelfGroupUserInProgress: false
}

const immutableState = Immutable.fromJS(initialState)

const groupReducer = (state = immutableState, action: GroupAction): any => {
  let newValues, updateMap, existingGroups, updateMapGroups, updateMapGroupsChild, updateMapGroupUsers, groupUser
  switch (action.type) {
    case LOADED_GROUPS:
      newValues = (action as LoadedGroupsAction)
      updateMap = new Map()
      existingGroups = state.get('groups').get('groups')
      updateMap.set('groups', (existingGroups.size != null || state.get('updateNeeded') === true) ? newValues.groups : existingGroups.concat(newValues.groups))
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
        console.log('GROUP UPDATEMAP')
        console.log(updateMap)
      return state
        .set('groups', updateMap)
        .set('updateNeeded', false)
        .set('getGroupsInProgress', false)
    case LOADED_INVITABLE_GROUPS:
      newValues = (action as LoadedGroupsAction)
      updateMap = new Map()
      existingGroups = state.get('invitableGroups').get('groups')
      updateMap.set('groups', (existingGroups.size != null || state.get('updateNeeded') === true) ? newValues.groups : existingGroups.concat(newValues.groups))
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      console.log('INVITABLE GROUP UPDATEMAP')
      console.log(updateMap)
      return state
          .set('invitableGroups', updateMap)
          .set('invitableUpdateNeeded', false)
          .set('getInvitableGroupsInProgress', false)
    case ADDED_GROUP:
      return state
          .set('updateNeeded', true)
          .set('invitableUpdateNeeded', true)
    case PATCHED_GROUP:
      return state
          .set('updateNeeded', true)
    case REMOVED_GROUP:
      return state
          .set('updateNeeded', true)
          .set('invitableUpdateNeeded', true)
    case INVITED_GROUP_USER:
      return state
          // .set('updateNeeded', true)
    case LEFT_GROUP:
      return state
          .set('updateNeeded', true)
    case FETCHING_GROUPS:
      return state
          .set('getGroupsInProgress', true)
    case FETCHING_INVITABLE_GROUPS:
      return state
          .set('getInvitableGroupsInProgress', true)
    case CREATED_GROUP_USER:
      newValues = (action as CreatedGroupUserAction)
        groupUser = newValues.groupUser
        updateMap = new Map(state.get('groups'))
        console.log('CREATED USER updateMap:')
        console.log(updateMap)
        updateMapGroups = updateMap.get('groups')
        console.log('updateMapGroups:')
        console.log(updateMapGroups)
        updateMapGroupsChild = _.find(updateMapGroups, (group) => group.id === groupUser.groupId)
        console.log('updateMapGroupsChild:')
        console.log(updateMapGroupsChild)
        if (updateMapGroupsChild != null) {
          updateMapGroupUsers = updateMapGroupsChild.groupUsers
          console.log('updateMapGroupUsers:')
          console.log(updateMapGroupUsers)
          console.log('groupUser:')
          console.log(groupUser)
          console.log(updateMapGroupUsers.concat([groupUser]))
          updateMapGroupUsers = Array.isArray(updateMapGroupUsers) ? updateMapGroupUsers.concat([groupUser]) : [groupUser]
          console.log('New updateMapGroupUsers:')
          console.log(updateMapGroupUsers)
          updateMapGroupsChild.groupUsers = updateMapGroupUsers
        }
        console.log(updateMapGroupsChild)
        console.log('updateMapGroups:')
        console.log(updateMapGroups)
        updateMap.set(updateMapGroups)

        console.log('GROUP USER CREATED UPDATEMAP:')
        console.log(updateMap)

      return state
          .set('groups', updateMap)
    case PATCHED_GROUP_USER:
      newValues = (action as CreatedGroupUserAction)
      groupUser = newValues.groupUser
      updateMap = new Map(state.get('groups'))
      updateMapGroups = updateMap.get('groups')
      updateMapGroupsChild = _.find(updateMapGroups, (group) => group.id === groupUser.groupId)
      if (updateMapGroupsChild != null) {
        updateMapGroupUsers = updateMapGroupsChild.groupUsers
        let updatedGroupUser = _.find(updateMapGroupUsers, (gUser) => gUser.id === groupUser.id)
        updatedGroupUser = groupUser
      }
      updateMap.set(updateMapGroups)

      console.log('GROUP USER PATCHED UPDATEMAP:')
      console.log(updateMap)

      return state
          .set('groups', updateMap)
    case REMOVED_GROUP_USER:
      newValues = (action as CreatedGroupUserAction)
      groupUser = newValues.groupUser
      updateMap = new Map(state.get('groups'))
      console.log('REMOVED USER updateMap:')
      console.log(updateMap)
      updateMapGroups = updateMap.get('groups')
      console.log('updateMapGroups:')
      console.log(updateMapGroups)
      updateMapGroupsChild = _.find(updateMapGroups, (group) => group.id === groupUser.groupId)
      console.log('updateMapGroupsChild:')
      console.log(updateMapGroupsChild)
      if (updateMapGroupsChild != null) {
        updateMapGroupUsers = updateMapGroupsChild.groupUsers
        console.log('groupUsers from which to remove:')
        console.log(updateMapGroupUsers)
        _.remove(updateMapGroupUsers, (gUser: GroupUser) => groupUser.id === gUser.id)
      }
      updateMap.set(updateMapGroups)

      console.log('GROUP USER REMOVED UPDATEMAP:')
      console.log(updateMap)

      return state
          .set('groups', updateMap)
  }

  return state
}

export default groupReducer
