import Immutable from 'immutable'
import {
  GroupUserAction,
  LoadedGroupUsersAction,
  LoadedSelfGroupUserAction
} from './actions'

import {
  FETCHING_GROUP_USERS,
  FETCHING_SELF_GROUP_USER,
  LOADED_GROUP_USERS,
  LOADED_SELF_GROUP_USER,
  REMOVED_GROUP_USER
} from '../actions'

export const initialState = {
  groupUsers: {
    groupUsers: [],
    total: 0,
    limit: 5,
    skip: 0
  },
  selfGroupUser: null,
  updateNeeded: true,
  selfUpdateNeeded: false,
  getGroupUsersInProgress: false,
  getSelfGroupUserInProgress: false
}

const immutableState = Immutable.fromJS(initialState)

const groupUserReducer = (state = immutableState, action: GroupUserAction): any => {
  let newValues, updateMap
  switch (action.type) {
    case LOADED_GROUP_USERS:
      newValues = (action as LoadedGroupUsersAction)
      updateMap = new Map()
      const existingGroupUsers = state.get('groupUsers').get('groupUsers')
      updateMap.set('groupUsers', (existingGroupUsers.size != null || state.get('updateNeeded') === true) ? newValues.groupUsers : existingGroupUsers.concat(newValues.groupUsers))
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
        .set('groupUsers', updateMap)
        .set('updateNeeded', false)
        .set('getGroupUsersInProgress', false)
    case REMOVED_GROUP_USER:
      return state
        .set('updateNeeded', true)
        .set('selfUpdateNeeded', true)
    case LOADED_SELF_GROUP_USER:
      newValues = (action as LoadedSelfGroupUserAction)
      return state
        .set('selfGroupUser', newValues.selfGroupUser)
        .set('selfUpdateNeeded', false)
        .set('getSelfGroupUserInProgress', false)
    case FETCHING_SELF_GROUP_USER:
      return state
          .set('getSelfGroupUserInProgress', true)
    case FETCHING_GROUP_USERS:
      return state
          .set('getGroupUsersInProgress', true)
  }

  return state
}

export default groupUserReducer
