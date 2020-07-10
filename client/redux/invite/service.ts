import { Dispatch } from 'redux'
import { client } from '../feathers'
import {dispatchAlertSuccess} from '../alert/service'
import {sentInvite, retrievedReceivedInvites, retrievedSentInvites} from './actions'


export function sendInvite (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    const inviteResult = await client.service('invite').create({
      inviteType: data.type,
      token: data.token,
      identityProviderType: data.identityProviderType,
      inviteeId: data.invitee
    })
    dispatchAlertSuccess(dispatch, 'Invite Sent')
    dispatch(sentInvite(inviteResult))
  }
}

export function retrieveReceivedInvites() {
  return async (dispatch: Dispatch, getState: any) => {
    const inviteResult = await client.service('invite').find({
      query: {
        type: 'received'
      }
    })
    dispatch(retrievedReceivedInvites(inviteResult.data))
  }
}

export function retrieveSentInvites() {
  return async (dispatch: Dispatch, getState: any) => {
    const inviteResult = await client.service('invite').find({
      query: {
        type: 'sent'
      }
    })
    dispatch(retrievedSentInvites(inviteResult.data))
  }
}