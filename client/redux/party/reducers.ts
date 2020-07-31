import Immutable from 'immutable'
import {
  PartyAction,
  LoadedPartyAction,
  PartyUserAction,
  LoadedPartyUsersAction,
  LoadedSelfPartyUserAction,
} from './actions'

import {
  LOADED_PARTY,
  ADDED_PARTY,
  REMOVED_PARTY,
  INVITED_PARTY_USER,
  REMOVED_PARTY_USER,
  FETCHING_PARTY_USERS
} from '../actions'

export const initialState = {
  party: null,
  selfUpdateNeeded: true,
  partyUsersUpdateNeeded: true,
  getPartyUsersInProgress: false,
  getSelfPartyUserInProgress: false,
  updateNeeded: true,
  partyUsers: {
    partyUsers: [],
    total: 0,
    limit: 5,
    skip: 0
  },
  selfPartyUser: null
}

const immutableState = Immutable.fromJS(initialState)

const partyReducer = (state = immutableState, action: PartyAction): any => {
  let newValues, updateMap
  switch (action.type) {
    case LOADED_PARTY:
      return state
        .set('party', (action as LoadedPartyAction).party)
        .set('updateNeeded', false)
        .set('partyUsersUpdateNeeded', true)
    case ADDED_PARTY:
      return state
          .set('updateNeeded', true)
          .set('selfUpdateNeeded', true)
    case REMOVED_PARTY:
      updateMap = new Map()
      updateMap.set('partyUsers', initialState.partyUsers.partyUsers)
      updateMap.set('skip', initialState.partyUsers.skip)
      updateMap.set('limit', initialState.partyUsers.limit)
      updateMap.set('total', initialState.partyUsers.total)
      return state
          .set('party', null)
          .set('updateNeeded', true)
          .set('selfUpdateNeeded', true)
          .set('partyUsersUpdatedNeeded', true)
          .set('partyUsers', updateMap)
    case INVITED_PARTY_USER:
      return state
          .set('updateNeeded', true)
    case REMOVED_PARTY_USER:
      return state
          .set('updateNeeded', true)
          .set('partyUsersUpdateNeeded', true)
    case FETCHING_PARTY_USERS:
      return state
          .set('getPartyUsersInProgress', true)
  }

  return state
}

export default partyReducer
