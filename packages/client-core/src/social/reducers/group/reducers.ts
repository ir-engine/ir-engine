import Immutable from 'immutable'
import {
  GroupAction,
  LoadedGroupsAction,
  CreatedGroupUserAction,
  PatchedGroupUserAction,
  RemovedGroupUserAction,
  CreatedGroupAction,
  PatchedGroupAction,
  RemovedGroupAction
} from './actions'

import _ from 'lodash'
import { GroupUser } from '@xrengine/common/src/interfaces/GroupUser'
import {
  LOADED_GROUPS,
  LOADED_INVITABLE_GROUPS,
  CREATED_GROUP,
  PATCHED_GROUP,
  REMOVED_GROUP,
  INVITED_GROUP_USER,
  LEFT_GROUP,
  FETCHING_GROUPS,
  FETCHING_INVITABLE_GROUPS,
  CREATED_GROUP_USER,
  PATCHED_GROUP_USER,
  REMOVED_GROUP_USER
} from '../actions'

export const initialGroupState = {
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
  closeDetails: ''
}

const immutableState = Immutable.fromJS(initialGroupState)

const groupReducer = (state = immutableState, action: GroupAction): any => {
  let newValues,
    updateMap,
    existingGroups,
    updateMapGroups,
    updateMapGroupsChild,
    updateMapGroupUsers,
    groupUser,
    updateGroup
  switch (action.type) {
    case LOADED_GROUPS:
      newValues = action as LoadedGroupsAction
      updateMap = new Map()
      existingGroups = state.get('groups').get('groups')
      updateMap.set(
        'groups',
        existingGroups.size != null || state.get('updateNeeded') === true
          ? newValues.groups
          : existingGroups.concat(newValues.groups)
      )
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state.set('groups', updateMap).set('updateNeeded', false).set('getGroupsInProgress', false)
    case LOADED_INVITABLE_GROUPS:
      newValues = action as LoadedGroupsAction
      updateMap = new Map()
      existingGroups = state.get('invitableGroups').get('groups')
      updateMap.set(
        'groups',
        existingGroups.size != null || state.get('updateNeeded') === true
          ? newValues.groups
          : existingGroups.concat(newValues.groups)
      )
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
        .set('invitableGroups', updateMap)
        .set('invitableUpdateNeeded', false)
        .set('getInvitableGroupsInProgress', false)
    case CREATED_GROUP:
      newValues = action as CreatedGroupAction
      return state.set('updateNeeded', true).set('invitableUpdateNeeded', true)
    case PATCHED_GROUP:
      newValues = action as PatchedGroupAction
      updateGroup = newValues.group
      updateMap = new Map(state.get('groups'))
      updateMapGroups = updateMap.get('groups')
      updateMapGroupsChild = _.find(updateMapGroups, (group) => {
        return group != null && group.id === groupUser.groupId
      })
      if (updateMapGroupsChild != null) {
        updateMapGroupsChild.name = updateGroup.name
        updateMapGroupsChild.description = updateGroup.description
      }
      updateMap.set('groups', updateMapGroups)
      return state.set('groups', updateMap)
    case REMOVED_GROUP:
      return state.set('updateNeeded', true).set('invitableUpdateNeeded', true)
    case INVITED_GROUP_USER:
      return state
    // .set('updateNeeded', true)
    case LEFT_GROUP:
      return state.set('updateNeeded', true)
    case FETCHING_GROUPS:
      return state.set('getGroupsInProgress', true)
    case FETCHING_INVITABLE_GROUPS:
      return state.set('getInvitableGroupsInProgress', true)
    case CREATED_GROUP_USER:
      newValues = action as CreatedGroupUserAction
      groupUser = newValues.groupUser
      updateMap = new Map(state.get('groups'))
      updateMapGroups = updateMap.get('groups')
      updateMapGroupsChild = _.find(updateMapGroups, (group) => {
        return group != null && group.id === groupUser.groupId
      })
      if (updateMapGroupsChild != null) {
        updateMapGroupUsers = updateMapGroupsChild.groupUsers
        const match = updateMapGroupUsers.find((gUser) => {
          return gUser != null && gUser.id === groupUser.id
        })
        updateMapGroupUsers = Array.isArray(updateMapGroupUsers)
          ? match == null
            ? updateMapGroupUsers.concat([groupUser])
            : updateMapGroupUsers.map((gUser) => (gUser.id === groupUser.id ? groupUser : gUser))
          : [groupUser]
        updateMapGroupsChild.groupUsers = updateMapGroupUsers
      }
      updateMap.set('groups', updateMapGroups)
      return state.set('groups', updateMap)
    case PATCHED_GROUP_USER:
      newValues = action as PatchedGroupUserAction
      groupUser = newValues.groupUser
      updateMap = new Map(state.get('groups'))
      updateMapGroups = updateMap.get('groups')
      updateMapGroupsChild = _.find(updateMapGroups, (group) => {
        return group != null && group.id === groupUser.groupId
      })
      if (updateMapGroupsChild != null) {
        // updateMapGroupUsers = updateMapGroupsChild.groupUsers
        updateMapGroupsChild.groupUsers = updateMapGroupsChild.groupUsers.map((gUser) =>
          gUser.id === groupUser.id ? groupUser : gUser
        )
      }
      updateMap.set('groups', updateMapGroups)
      return state.set('groups', updateMap)
    case REMOVED_GROUP_USER:
      newValues = action as RemovedGroupUserAction
      groupUser = newValues.groupUser
      const self = newValues.self
      updateMap = new Map(state.get('groups'))
      updateMapGroups = updateMap.get('groups')
      updateMapGroupsChild = _.find(updateMapGroups, (group) => {
        return group != null && group.id === groupUser.groupId
      })
      if (updateMapGroupsChild != null) {
        updateMapGroupUsers = updateMapGroupsChild.groupUsers
        _.remove(updateMapGroupUsers, (gUser: GroupUser) => groupUser.id === gUser.id)
      }
      updateMap.set('groups', updateMapGroups)

      let returned = state.set('groups', updateMap)

      if (self === true) {
        returned = returned.set('closeDetails', groupUser.groupId).set('updateNeeded', true)
      }

      return returned
  }

  return state
}

export default groupReducer
