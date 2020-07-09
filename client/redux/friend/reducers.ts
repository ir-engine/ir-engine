import Immutable from 'immutable'
import {
  FriendAction,
  LoadedFriendsAction
} from './actions'

import {
  LOADED_FRIENDS,
} from '../actions'
import { RelationshipSeed } from '../../../shared/interfaces/Relationship'

export const initialState = {
  relationship: RelationshipSeed,
  friends: [],
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const userReducer = (state = immutableState, action: FriendAction): any => {
  switch (action.type) {
    case LOADED_FRIENDS:
      return state
        .set('friends', (action as LoadedFriendsAction).friends)
        .set('updateNeeded', false)
  }

  return state
}

export default userReducer
