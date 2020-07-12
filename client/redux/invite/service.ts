import { Dispatch } from 'redux'
import { client } from '../feathers'
import {dispatchAlertSuccess} from '../alert/service'
import {
  sentInvite,
  retrievedReceivedInvites,
  retrievedSentInvites,
  removedInvite
} from './actions'


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

export function retrieveReceivedInvites(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any) => {
    const inviteResult = await client.service('invite').find({
      query: {
        type: 'received',
        $limit: limit != null ? limit :  getState().get('invite').get('receivedInvites').get('limit'),
        $skip: skip != null ? skip : getState().get('invite').get('receivedInvites').get('skip')
      }
    })
    console.log('RECEIVED INVITES:')
    console.log(inviteResult)
    dispatch(retrievedReceivedInvites(inviteResult))
  }
}

export function retrieveSentInvites(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any) => {
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
  }
}

function removeInvite(inviteId: string) {
  return (dispatch: Dispatch): any => {
    client.service('invite').remove(inviteId)
        .then((res: any) => {
          console.log('REMOVED INVITE')
          dispatch(removedInvite())
        })
        .catch((err: any) => {
          console.log(err)
        })
    // .finally(() => dispatch(actionProcessing(false)))
  }
}

export function deleteInvite(inviteId: string) {
  console.log('deleteInvite:')
  console.log(inviteId)
  return removeInvite(inviteId)
}
