import Immutable from 'immutable'
import {
  InviteAction,
  InviteSentAction,
  InvitesRetrievedAction,
  InviteRemovedAction
} from './actions'

import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  REMOVED_INVITE,
} from '../actions'

export const initialState = {
  receivedInvites: [],
  sentInvites: [],
  sentUpdateNeeded: true,
  receivedUpdateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const inviteReducer = (state = immutableState, action: InviteAction): any => {
  switch (action.type) {
    case INVITE_SENT:
      return state.set('sentUpdateNeeded', true)
    case SENT_INVITES_RETRIEVED:
      return state
          .set('sentInvites', (action as InvitesRetrievedAction).invites)
          .set('sentUpdateNeeded', false)
    case RECEIVED_INVITES_RETRIEVED:
      return state
          .set('receivedInvites', (action as InvitesRetrievedAction).invites)
          .set('receivedUpdateNeeded', false)
    case REMOVED_INVITE:
      return state.set('sentUpdateNeeded', true)
  }

  return state
}

export default inviteReducer
