import { Dispatch } from 'redux'
import { client } from '../feathers'
import {dispatchAlertSuccess} from '../alert/service'
import {
  sentInvite,
  retrievedReceivedInvites,
  retrievedSentInvites,
  removedInvite,
  acceptedInvite,
  declinedInvite,
  setInviteTarget,
  fetchingReceivedInvites,
  fetchingSentInvites
} from './actions'
import {dispatchAlertError} from '../alert/service'

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[0-9a-f]{32}$/

export function sendInvite (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    let send = true

    if (data.identityProviderType === 'email') {
      if (emailRegex.test(data.token) !== true) {
        dispatchAlertError(dispatch, 'Invalid email address')
        send = false
      }
    }
    if (data.identityProviderType === 'sms') {
      if (phoneRegex.test(data.token) !== true) {
        dispatchAlertError(dispatch, 'Invalid 10-digit US phone number')
        send = false
      }
    }
    if (data.invitee != null) {
      if (userIdRegex.test(data.invitee) !== true) {
        dispatchAlertError(dispatch, 'Invalid user ID')
        send = false
      }
    }
    if ((data.token == null || data.token.length === 0) && (data.invitee == null || data.invitee.length === 0)) {
      dispatchAlertError(dispatch, `Not a valid recipient`)
      send = false
    }

    console.log(data.type)
    if (send === true) {
      try {
        const inviteResult = await client.service('invite').create({
          inviteType: data.type,
          token: data.token,
          targetObjectId: data.targetObjectId,
          identityProviderType: data.identityProviderType,
          inviteeId: data.invitee
        })
        dispatchAlertSuccess(dispatch, 'Invite Sent')
        dispatch(sentInvite(inviteResult))
      } catch (err) {
        dispatchAlertError(dispatch, err.message)
      }
    }
  }
}

export function retrieveReceivedInvites(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingReceivedInvites())
    try {
      const inviteResult = await client.service('invite').find({
        query: {
          type: 'received',
          $limit: limit != null ? limit : getState().get('invite').get('receivedInvites').get('limit'),
          $skip: skip != null ? skip : getState().get('invite').get('receivedInvites').get('skip')
        }
      })
      console.log('RECEIVED INVITES:')
      console.log(inviteResult)
      dispatch(retrievedReceivedInvites(inviteResult))
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function retrieveSentInvites(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingSentInvites())
    try {
      const inviteResult = await client.service('invite').find({
        query: {
          type: 'sent',
          $limit: limit != null ? limit : getState().get('invite').get('sentInvites').get('limit'),
          $skip: skip != null ? skip : getState().get('invite').get('sentInvites').get('skip')
        }
      })
      console.log('SENT INVITES:')
      console.log(inviteResult)
      dispatch(retrievedSentInvites(inviteResult))
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

function removeInvite(inviteId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(inviteId)
      dispatch(removedInvite())
    } catch(err) {
      dispatchAlertError(dispatch, err.message)}
  }
}

export function deleteInvite(inviteId: string) {
  console.log('deleteInvite:')
  console.log(inviteId)
  return removeInvite(inviteId)
}

export function acceptInvite(inviteId: string, passcode: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('ACCEPTING INVITE')
    console.log(inviteId)
    console.log(passcode)
    try {
      await client.service('accept-invite').get(inviteId, {
        query: {
          passcode: passcode
        }
      })
      dispatch(acceptedInvite())
    } catch(err) {
      dispatchAlertError(dispatch, err.message)}
  }
}

export function declineInvite(inviteId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(inviteId)
      dispatch(declinedInvite())
    } catch(err) {
      dispatchAlertError(dispatch, err.message)}
  }
}

export function updateInviteTarget(targetObjectType?: string, targetObjectId?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(setInviteTarget(targetObjectType, targetObjectId))
  }
}
