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
  LEFT_GROUP
} from '../actions'

export const initialState = {
  groups: {
    groups: [],
    total: 0,
    limit: 5,
    skip: 0
  },
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const groupReducer = (state = immutableState, action: GroupAction): any => {
  switch (action.type) {
    case LOADED_GROUPS:
      const newValues = (action as LoadedGroupsAction)
      const updateMap = new Map()
      updateMap.set('groups', newValues.groups)
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
        console.log('GROUP UPDATEMAP')
        console.log(updateMap)
      return state
        .set('groups', updateMap)
        .set('updateNeeded', false)
    case ADDED_GROUP:
      return state
          .set('updateNeeded', true)
    case PATCHED_GROUP:
      return state
          .set('updateNeeded', true)
    case REMOVED_GROUP:
      return state
          .set('updateNeeded', true)
    case INVITED_GROUP_USER:
      return state
          .set('updateNeeded', true)
    case REMOVED_GROUP_USER:
      return state
          .set('updateNeeded', true)
    case LEFT_GROUP:
      return state
          .set('updateNeeded', true)
  }

  return state
}

export default groupReducer
