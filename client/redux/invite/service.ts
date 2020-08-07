import { Dispatch } from 'redux'
import { client } from '../feathers'
import {dispatchAlertSuccess} from '../alert/service'
import {
  retrievedReceivedInvites,
  retrievedSentInvites,
  removedInvite,
  createdInvite,
  setInviteTarget,
  fetchingReceivedInvites,
  fetchingSentInvites
} from './actions'
import {dispatchAlertError} from '../alert/service'
import store from "../store";
import {User} from "../../../shared/interfaces/User";

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

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
      data.token = '+1' + data.token
    }
    if (data.inviteeId != null) {
      if (userIdRegex.test(data.inviteeId) !== true) {
        dispatchAlertError(dispatch, 'Invalid user ID')
        send = false
      }
    }
    if ((data.token == null || data.token.length === 0) && (data.inviteeId == null || data.inviteeId.length === 0)) {
      dispatchAlertError(dispatch, `Not a valid recipient`)
      send = false
    }

    if (data.identityProviderType === 'email' || data.identityProviderType === 'sms') {
      const existingIdentityProviderResult = await client.service('identity-provider').find({
        query: {
          token: data.token
        }
      })
      if (existingIdentityProviderResult.total > 0 && existingIdentityProviderResult.data[0].userId != null) {
        const inviteeId = existingIdentityProviderResult.data[0].userId
        if (data.type === 'friend') {
          const reciprocalFriendResult = await client.service('user-relationship').find({
            query: {
              userRelationshipType: 'friend',
              userId: inviteeId,
              relatedUserId: getState().get('auth').get('user').id
            }
          })

          if (reciprocalFriendResult.total > 0) {
            send = false
            dispatchAlertSuccess(dispatch, 'You\'re already friends with that person.')
          }
        }
        else if (data.type === 'group') {
          const existingGroupUserResult = await client.service('group-user').find({
            query: {
              groupId: data.targetObjectId,
              userId: inviteeId
            }
          })
          if (existingGroupUserResult.total > 0) {
            send = false
            dispatchAlertSuccess(dispatch, 'That person is already part of that group.')
          }
        }
        else if (data.type === 'party') {
          const existingPartyUserResult = await client.service('party-user').find({
            query: {
              partyId: data.targetObjectId,
              userId: inviteeId
            }
          })
          if (existingPartyUserResult.total > 0) {
            send = false;
            dispatchAlertSuccess(dispatch, 'That person is already part of your current party.')
          }
        }
      }
    } else {
      if (data.type === 'friend') {
        const reciprocalFriendResult = await client.service('user-relationship').find({
          query: {
            userRelationshipType: 'friend',
            userId: data.inviteeId,
            relatedUserId: getState().get('auth').get('user').id
          }
        })

        if (reciprocalFriendResult.total > 0) {
          send = false
          dispatchAlertSuccess(dispatch, 'You\'re already friends with that person.')
        }
      }
      else if (data.type === 'group') {
        const existingGroupUserResult = await client.service('group-user').find({
          query: {
            groupId: data.targetObjectId,
            userId: data.inviteeId
          }
        })
        if (existingGroupUserResult.total > 0) {
          send = false
          dispatchAlertSuccess(dispatch, 'That person is already part of that group.')
        }
      }
      else if (data.type === 'party') {
        const existingPartyUserResult = await client.service('party-user').find({
          query: {
            partyId: data.targetObjectId,
            userId: data.inviteeId
          }
        })
        if (existingPartyUserResult.total > 0) {
          send = false;
          dispatchAlertSuccess(dispatch, 'That person is already part of your current party.')
        }
      }
    }
    if (send === true) {
      const existingInvite = await client.service('invite').find({
        query: {
          inviteType: data.type,
          token: data.token,
          targetObjectId: data.targetObjectId,
          identityProviderType: data.identityProviderType,
          inviteeId: data.inviteeId
        }
      })
      if (existingInvite.total > 0) {
        dispatchAlertSuccess(dispatch, `You\'ve already sent a ${data.type} invite to that person`)
      } else {

        try {
          await client.service('invite').create({
            inviteType: data.type,
            token: data.token,
            targetObjectId: data.targetObjectId,
            identityProviderType: data.identityProviderType,
            inviteeId: data.inviteeId
          })
          dispatchAlertSuccess(dispatch, 'Invite Sent')
        } catch (err) {
          console.log(err)
          dispatchAlertError(dispatch, err.message)
        }
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
      dispatch(retrievedReceivedInvites(inviteResult))
    } catch(err) {
      console.log(err)
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
      dispatch(retrievedSentInvites(inviteResult))
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

function removeInvite(inviteId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(inviteId)
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)}
  }
}

export function deleteInvite(inviteId: string) {
  return removeInvite(inviteId)
}

export function acceptInvite(inviteId: string, passcode: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('a-i').get(inviteId, {
        query: {
          t: passcode
        }
      })
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)}
  }
}

export function declineInvite(inviteId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(inviteId)
    } catch(err) {
      dispatchAlertError(dispatch, err.message)}
  }
}

export function updateInviteTarget(targetObjectType?: string, targetObjectId?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(setInviteTarget(targetObjectType, targetObjectId))
  }
}


client.service('invite').on('created', (params) => {
  const selfUser = (store.getState() as any).get('auth').get('user') as User
  store.dispatch(createdInvite(params.invite, selfUser))
})

client.service('invite').on('removed', (params) => {
  const selfUser = (store.getState() as any).get('auth').get('user') as User
  store.dispatch(removedInvite(params.invite, selfUser))
})