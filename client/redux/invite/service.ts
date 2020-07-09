import { Dispatch } from 'redux'
import { client } from '../feathers'
import {dispatchAlertSuccess} from '../alert/service'
import {sentInvite} from './actions'


export function sendInvite (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    console.log('SENDINVITE')
    console.log(data)
    const inviteResult = await client.service('invite').create({
      inviteType: data.type,
      token: data.token,
      identityProviderType: data.identityProviderType,
      invitee: data.invitee
    })
    console.log(inviteResult)
    dispatchAlertSuccess(dispatch, 'Invite Sent')
    dispatch(sentInvite(inviteResult))
  }
}