import Immutable from 'immutable';
import {
  InviteAction,
  InvitesRetrievedAction,
  InviteTargetSetAction
} from './actions';
import _ from 'lodash';

import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  CREATED_RECEIVED_INVITE,
  REMOVED_RECEIVED_INVITE,
  CREATED_SENT_INVITE,
  REMOVED_SENT_INVITE,
  ACCEPTED_INVITE,
  DECLINED_INVITE,
  INVITE_TARGET_SET,
  FETCHING_RECEIVED_INVITES,
  FETCHING_SENT_INVITES
} from '../actions';

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
  receivedUpdateNeeded: true,
  getSentInvitesInProgress: false,
  getReceivedInvitesInProgress: false,
  targetObjectId: '',
  targetObjectType: ''
};

const immutableState = Immutable.fromJS(initialState);

const inviteReducer = (state = immutableState, action: InviteAction): any => {
  let newValues, updateMap;
  switch (action.type) {
    case INVITE_SENT:
      return state.set('sentUpdateNeeded', true);
    case SENT_INVITES_RETRIEVED:
      newValues = (action as InvitesRetrievedAction);
      const sentInvites = state.get('sentInvites').get('invites');
      updateMap = new Map();
      updateMap.set('invites', (sentInvites.size != null || state.get('sentUpdateNeeded') === true) ? newValues.invites : sentInvites.concat(newValues.invites));
      updateMap.set('skip', newValues.skip);
      updateMap.set('limit', newValues.limit);
      updateMap.set('total', newValues.total);
      return state
          .set('sentInvites', updateMap)
          .set('sentUpdateNeeded', false)
          .set('getSentInvitesInProgress', false);
    case RECEIVED_INVITES_RETRIEVED:
      newValues = (action as InvitesRetrievedAction);
      const receivedInvites = state.get('receivedInvites').get('invites');
      updateMap = new Map();
      updateMap.set('invites', (receivedInvites.size != null || state.get('receivedUpdateNeeded') === true) ? newValues.invites : receivedInvites.concat(newValues.invites));
      updateMap.set('skip', newValues.skip);
      updateMap.set('limit', newValues.limit);
      updateMap.set('total', newValues.total);
      return state
          .set('receivedInvites', updateMap)
          .set('receivedUpdateNeeded', false)
          .set('getReceivedInvitesInProgress', false);
    case CREATED_RECEIVED_INVITE:
      return state.set('receivedUpdateNeeded', true);
    case CREATED_SENT_INVITE:
      return state.set('sentUpdateNeeded', true);
    case REMOVED_RECEIVED_INVITE:
      return state.set('receivedUpdateNeeded', true);
    case REMOVED_SENT_INVITE:
      return state.set('sentUpdateNeeded', true);
    case ACCEPTED_INVITE:
      return state.set('receivedUpdateNeeded', true);
    case DECLINED_INVITE:
      return state.set('receivedUpdateNeeded', true);
    case INVITE_TARGET_SET:
      newValues = (action as InviteTargetSetAction);
      return state
          .set('targetObjectId', newValues.targetObjectId || '')
          .set('targetObjectType', newValues.targetObjectType || '');
    case FETCHING_SENT_INVITES:
      return state
          .set('getSentInvitesInProgress', true);
    case FETCHING_RECEIVED_INVITES:
      return state
          .set('getReceivedInvitesInProgress', true);
  }

  return state;
};

export default inviteReducer;
