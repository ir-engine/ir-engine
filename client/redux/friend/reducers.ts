import Immutable from 'immutable'
import {
  FriendAction,
  LoadedFriendsAction
} from './actions'

import {
  CHANGED_RELATION,
  LOADED_FRIENDS,
  REMOVED_FRIEND,
} from '../actions'

export const initialState = {
  friends: {
    friends: [],
    total: 0,
    limit: 5,
    skip: 0
  },
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const friendReducer = (state = immutableState, action: FriendAction): any => {
  switch (action.type) {
    case LOADED_FRIENDS:
      const newValues = (action as LoadedFriendsAction)
      const updateMap = new Map()
      const existingFriends = state.get('friends').get('friends')
      updateMap.set('friends', (existingFriends.size != null || state.get('updateNeeded') === true) ? newValues.friends : existingFriends.concat(newValues.friends))
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
        .set('friends', updateMap)
        .set('updateNeeded', false)
    case REMOVED_FRIEND:
      return state
          .set('updateNeeded', true)
  }

  return state
}

export default friendReducer
