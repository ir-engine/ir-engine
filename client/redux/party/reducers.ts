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
  FETCHING_PARTY_USERS,
  LOADED_PARTY_USERS,
  LOADED_SELF_PARTY_USER, FETCHING_SELF_PARTY_USER
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
    case LOADED_PARTY_USERS:
      newValues = (action as LoadedPartyUsersAction)
      updateMap = new Map()
      const existingPartyUsers = state.get('partyUsers').get('partyUsers')
        console.log('PARTY USER STATE UPDATE')
        console.log(existingPartyUsers.size)
        console.log(state.get('partyUsersUpdateNeeded'))
      updateMap.set('partyUsers', (existingPartyUsers.size != null || state.get('partyUsersUpdateNeeded') === true) ? newValues.partyUsers: existingPartyUsers.concat(newValues.partyUsers))
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
          .set('partyUsers', updateMap)
          .set('partyUsersUpdateNeeded', false)
          .set('getPartyUsersInProgress', false)
    case REMOVED_PARTY_USER:
      return state
          .set('updateNeeded', true)
          .set('partyUsersUpdateNeeded', true)
    case LOADED_SELF_PARTY_USER:
      return state
          .set('selfPartyUser', (action as LoadedSelfPartyUserAction).selfPartyUser)
          .set('selfUpdateNeeded', false)
          .set('getSelfPartyUserInProgress', false)
    case FETCHING_PARTY_USERS:
      return state
          .set('getPartyUsersInProgress', true)
    case FETCHING_SELF_PARTY_USER:
      return state
          .set('getSelfPartyUserInProgress', true)
  }

  return state
}

export default partyReducer
