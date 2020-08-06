import Immutable from 'immutable'
import {
  InviteAction,
  InvitesRetrievedAction,
  InviteTargetSetAction,
  CreatedInviteAction,
  RemovedInviteAction
} from './actions'
import _ from 'lodash'

import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  CREATED_INVITE,
  REMOVED_INVITE,
  ACCEPTED_INVITE,
  DECLINED_INVITE,
  INVITE_TARGET_SET,
  FETCHING_RECEIVED_INVITES,
  FETCHING_SENT_INVITES
} from '../actions'
import { Invite } from '../../../shared/interfaces/Invite'
import {User} from "../../../shared/interfaces/User";

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
}

const immutableState = Immutable.fromJS(initialState)

const inviteReducer = (state = immutableState, action: InviteAction): any => {
  let newValues, updateMap, updateMapInvites, updateMapInvitesChild, stateUpdate, selfUser
  switch (action.type) {
    case INVITE_SENT:
      return state.set('sentUpdateNeeded', true)
    case SENT_INVITES_RETRIEVED:
      newValues = (action as InvitesRetrievedAction)
      const sentInvites = state.get('sentInvites').get('invites')
      updateMap = new Map()
      updateMap.set('invites', (sentInvites.size != null || state.get('sentUpdateNeeded') === true) ? newValues.invites : sentInvites.concat(newValues.invites))
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
          .set('sentInvites', updateMap)
          .set('sentUpdateNeeded', false)
          .set('getSentInvitesInProgress', false)
    case RECEIVED_INVITES_RETRIEVED:
      newValues = (action as InvitesRetrievedAction)
      const receivedInvites = state.get('receivedInvites').get('invites')
      updateMap = new Map()
      updateMap.set('invites', (receivedInvites.size != null || state.get('receivedUpdateNeeded') === true) ? newValues.invites : receivedInvites.concat(newValues.invites))
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state
          .set('receivedInvites', updateMap)
          .set('receivedUpdateNeeded', false)
          .set('getReceivedInvitesInProgress', false)
    case CREATED_INVITE:
      newValues = (action as CreatedInviteAction)
      const createdInvite = newValues.invite
      selfUser = newValues.selfUser
     if (selfUser.id === createdInvite.userId) {
       updateMap = new Map(state.get('sentInvites'))
       updateMapInvites = updateMap.get('invites')
       updateMapInvites = updateMapInvites.concat([createdInvite])
       updateMap.set('invites', updateMapInvites)
       stateUpdate = state
           .set('sentInvites', updateMap)
     }
     else if (selfUser.id === createdInvite.inviteeId) {
       updateMap = new Map(state.get('receivedInvites'))
       updateMapInvites = updateMap.get('invites')
       updateMapInvites = updateMapInvites.concat([createdInvite])
       updateMap.set('invites', updateMapInvites)
       stateUpdate = state
           .set('receivedInvites', updateMap)
     }
     else {
       console.log('Malformed invite retrieved, neither userId nor inviteeId matches selfUser')
       console.log(createdInvite)
     }
     return stateUpdate
    case REMOVED_INVITE:
      newValues = (action as RemovedInviteAction)
      const removedInvite = newValues.invite
      selfUser = newValues.selfUser
      if (selfUser.id === removedInvite.userId) {
        updateMap = new Map(state.get('sentInvites'))
        updateMapInvites = updateMap.get('invites')
        updateMapInvitesChild = _.find(updateMapInvites, (invite: Invite) => invite.id === removedInvite.id)
        if (updateMapInvitesChild != null) {
          _.remove(updateMapInvites, (invite: Invite) => invite.id === removedInvite.id)
          updateMap.set('skip', updateMap.set('skip') - 1)
          updateMap.set('invites', updateMapInvites)
          stateUpdate = state.set('sentInvites', updateMap)
        }
      } else {
        updateMap = new Map(state.get('receivedInvites'))
        updateMapInvites = updateMap.get('invites')
        updateMapInvitesChild = _.find(updateMapInvites, (invite: Invite) => invite.id === removedInvite.id)
        if (updateMapInvitesChild != null) {
          _.remove(updateMapInvites, (invite: Invite) => invite.id === removedInvite.id)
          updateMap.set('skip', updateMap.set('skip') - 1)
          updateMap.set('invites', updateMapInvites)
          stateUpdate = state.set('receivedInvites', updateMap)
        }
      }
     return stateUpdate
    case ACCEPTED_INVITE:
      return state.set('receivedUpdateNeeded', true)
    case INVITE_TARGET_SET:
      newValues = (action as InviteTargetSetAction)
      return state
          .set('targetObjectId', newValues.targetObjectId || '')
          .set('targetObjectType', newValues.targetObjectType || '')
    case FETCHING_SENT_INVITES:
      return state
          .set('getSentInvitesInProgress', true)
    case FETCHING_RECEIVED_INVITES:
      return state
          .set('getReceivedInvitesInProgress', true)
  }

  return state
}

export default inviteReducer
