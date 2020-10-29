import Immutable from 'immutable';
import {
  PartyAction,
  LoadedPartyAction,
  CreatedPartyUserAction,
  PatchedPartyUserAction,
  RemovedPartyUserAction
} from './actions';

import {
  LOADED_PARTY,
  CREATED_PARTY,
  REMOVED_PARTY,
  INVITED_PARTY_USER,
  REMOVED_PARTY_USER,
  CREATED_PARTY_USER,
  PATCHED_PARTY_USER
} from '../actions';
import { PartyUser } from '@xr3ngine/common/interfaces/PartyUser';
import _ from 'lodash';

export const initialState = {
  party: {},
  updateNeeded: true
};

const immutableState = Immutable.fromJS(initialState);

const partyReducer = (state = immutableState, action: PartyAction): any => {
  let newValues, updateMap, partyUser, updateMapPartyUsers;
  switch (action.type) {
    case LOADED_PARTY:
      return state
        .set('party', (action as LoadedPartyAction).party)
        .set('updateNeeded', false);
    case CREATED_PARTY:
      return state
          .set('updateNeeded', true);
    case REMOVED_PARTY:
      updateMap = new Map();
      return state
          .set('party', {})
          .set('updateNeeded', true);
    case INVITED_PARTY_USER:
      return state
          .set('updateNeeded', true);
    case CREATED_PARTY_USER:
      console.log('CREATED_PARTY_USER REDUCER');
      newValues = (action as CreatedPartyUserAction);
      partyUser = newValues.partyUser;
      updateMap = _.cloneDeep(state.get('party'));
      if (updateMap != null) {
        updateMapPartyUsers = updateMap.partyUsers;
        updateMapPartyUsers = Array.isArray(updateMapPartyUsers) ? (updateMapPartyUsers.find(pUser => pUser.id === partyUser.id) == null ? updateMapPartyUsers.concat([partyUser]) : updateMap.partyUsers.map((pUser) => pUser.id === partyUser.id ? partyUser : pUser)) : [partyUser];
        updateMap.partyUsers = updateMapPartyUsers;
      }

      return state
          .set('party', updateMap);
    case PATCHED_PARTY_USER:
      newValues = (action as PatchedPartyUserAction);
      partyUser = newValues.partyUser;
      updateMap = _.cloneDeep(state.get('party'));
      if (updateMap != null) {
        updateMap.partyUsers = updateMap.partyUsers.map((pUser) => pUser.id === partyUser.id ? partyUser : pUser);
      }

      return state
          .set('party', updateMap);
    case REMOVED_PARTY_USER:
      newValues = (action as RemovedPartyUserAction);
      partyUser = newValues.partyUser;
      updateMap = _.cloneDeep(state.get('party'));
      if (updateMap != null) {
        updateMapPartyUsers = updateMap.partyUsers;
        _.remove(updateMapPartyUsers, (pUser: PartyUser) => partyUser.id === pUser.id);
      }
      return state
          .set('party', updateMap)
          .set('updateNeeded', true);
  }

  return state;
};

export default partyReducer;
