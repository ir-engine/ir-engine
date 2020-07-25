import Immutable from 'immutable'
import {
  GroupAction,
  LoadedGroupsAction
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
  FETCHING_INVITABLE_GROUPS
} from '../actions'

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
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const groupReducer = (state = immutableState, action: GroupAction): any => {
  let newValues, updateMap, existingGroups
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
    case REMOVED_GROUP_USER:
      return state
          .set('updateNeeded', true)
    case LEFT_GROUP:
      return state
          .set('updateNeeded', true)
    case FETCHING_GROUPS:
      return state
          .set('getGroupsInProgress', true)
    case FETCHING_INVITABLE_GROUPS:
      return state
          .set('getInvitableGroupsInProgress', true)
  }

  return state
}

export default groupReducer
