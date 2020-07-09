import Immutable from 'immutable'
import {
  InviteAction,
  InviteSentAction
} from './actions'

import {
  INVITE_SENT,
} from '../actions'

export const initialState = {
  friends: [],
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const inviteReducer = (state = immutableState, action: InviteAction): any => {
  switch (action.type) {
    case INVITE_SENT:
      return state
        .set('invites', (action as InviteSentAction).id)
        .set('updateNeeded', false)
  }

  return state
}

export default inviteReducer
