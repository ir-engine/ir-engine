import Immutable from 'immutable'
import {
  UserAction,
  LoadedUserRelationshipAction,
  LoadedUsersAction
} from './actions'

import {
  LOADED_RELATIONSHIP,
  LOADED_USERS,
  CHANGED_RELATION
} from '../actions'
import { RelationshipSeed } from '../../interfaces/Relationship'

export const initialState = {
  relationship: RelationshipSeed,
  users: [],
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const userReducer = (state = immutableState, action: UserAction): any => {
  switch (action.type) {
    case LOADED_RELATIONSHIP:
      return state
        .set('relationship', (action as LoadedUserRelationshipAction).relationship)
        .set('updateNeeded', false)
    case LOADED_USERS:
      return state
        .set('users', (action as LoadedUsersAction).users)
        .set('updateNeeded', false)
    case CHANGED_RELATION:
      return state
        .set('updateNeeded', true)
  }

  return state
}

export default userReducer
