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


export function sendInvite (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    const inviteResult = await client.service('invite').create({
      inviteType: data.type,
      token: data.token,
      targetObjectId: data.targetObjectId,
      identityProviderType: data.identityProviderType,
      inviteeId: data.invitee
    })
    dispatchAlertSuccess(dispatch, 'Invite Sent')
    dispatch(sentInvite(inviteResult))
  }
}

export function retrieveReceivedInvites(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingReceivedInvites())
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
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingSentInvites())
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
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('invite').remove(inviteId)
    dispatch(removedInvite())
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
    await client.service('accept-invite').get(inviteId, {
      query: {
        passcode: passcode
      }
    })
    dispatch(acceptedInvite())
  }
}

export function declineInvite(inviteId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('invite').remove(inviteId)
    dispatch(declinedInvite())
  }
}

export function updateInviteTarget(targetObjectType?: string, targetObjectId?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(setInviteTarget(targetObjectType, targetObjectId))
  }
}
