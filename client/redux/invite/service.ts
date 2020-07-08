import { Dispatch } from 'redux'
import { client } from '../feathers'
import {dispatchAlertSuccess} from '../alert/service'
import {sentInvite} from './actions'


export function sendInvite (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    const inviteResult = await client.service('invite').create({
      type: data.type,
      token: data.token,
      identityProviderType: data.identityProviderType,
      invitee: data.invitee
    })
    dispatchAlertSuccess(dispatch, 'Invite Sent')
    dispatch(sentInvite(inviteResult))
  }
}