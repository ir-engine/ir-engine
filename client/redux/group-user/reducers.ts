import Immutable from 'immutable'
import {
  GroupUserAction,
  LoadedGroupUsersAction,
  LoadedSelfGroupUserAction
} from './actions'

import {
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
  selfUpdateNeeded: false
}

const immutableState = Immutable.fromJS(initialState)

const groupUserReducer = (state = immutableState, action: GroupUserAction): any => {
  let newValues, updateMap
  switch (action.type) {
    case LOADED_GROUP_USERS:
      newValues = (action as LoadedGroupUsersAction)
      updateMap = new Map()
      updateMap.set('groupUsers', newValues.groupUsers)
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
        .set('groupUsers', updateMap)
        .set('updateNeeded', false)
    case REMOVED_GROUP_USER:
      return state
        .set('updateNeeded', true)
    case LOADED_SELF_GROUP_USER:
      newValues = (action as LoadedSelfGroupUserAction)
      return state
        .set('selfGroupUser', newValues.selfGroupUser)
        .set('selfUpdateNeeded', false)

  }

  return state
}

export default groupUserReducer
