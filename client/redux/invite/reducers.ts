import Immutable from 'immutable'
import {
  InviteAction,
  InviteSentAction,
  InvitesRetrievedAction,
  InviteRemovedAction
} from './actions'
import _ from 'lodash'

import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  REMOVED_INVITE,
} from '../actions'

export const initialState = {
  receivedInvites: {
    invites: [],
    skip: 0,
    limit: 5,
    total: 0
  },
  sentInvites: {
    invites: [],
    skip: 0,
    limit: 5,
    total: 0
  },
  sentUpdateNeeded: true,
  receivedUpdateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const inviteReducer = (state = immutableState, action: InviteAction): any => {
  let newValues, updateMap
  switch (action.type) {
    case INVITE_SENT:
      return state.set('sentUpdateNeeded', true)
    case SENT_INVITES_RETRIEVED:
      newValues = (action as InvitesRetrievedAction)
      updateMap = new Map()
      updateMap.set('invites', newValues.invites)
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
          .set('sentInvites', updateMap)
          .set('sentUpdateNeeded', false)
    case RECEIVED_INVITES_RETRIEVED:
      newValues = (action as InvitesRetrievedAction)
      updateMap = new Map()
      updateMap.set('invites', newValues.invites)
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
          .set('receivedInvites', updateMap)
          .set('receivedUpdateNeeded', false)
    case REMOVED_INVITE:
      return state.set('sentUpdateNeeded', true)
  }

  return state
}

export default inviteReducer
