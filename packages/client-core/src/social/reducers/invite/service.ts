import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import {
  sentInvite,
  retrievedReceivedInvites,
  retrievedSentInvites,
  createdReceivedInvite,
  removedReceivedInvite,
  createdSentInvite,
  removedSentInvite,
  acceptedInvite,
  declinedInvite,
  setInviteTarget,
  fetchingReceivedInvites,
  fetchingSentInvites
} from './actions'
import { Invite } from '@xrengine/common/src/interfaces/Invite'
import Store from '../../../store'
import { User } from '@xrengine/common/src/interfaces/User'

const store = Store.store

const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
const inviteCodeRegex = /^[0-9a-fA-F]{8}$/

import { Config } from '@xrengine/common/src/config'
import { dispatchAlertError, dispatchAlertSuccess } from '../../../common/reducers/alert/service'

export function sendInvite(data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    if (data.identityProviderType === 'email') {
      if (emailRegex.test(data.token) !== true) {
        dispatchAlertError(dispatch, 'Invalid email address')
        return
      }
    }
    if (data.identityProviderType === 'sms') {
      if (phoneRegex.test(data.token) !== true) {
        dispatchAlertError(dispatch, 'Invalid 10-digit US phone number')
        return
      }
    }

    if (data.inviteCode != null) {
      if (inviteCodeRegex.test(data.inviteCode) !== true) {
        dispatchAlertError(dispatch, 'Invalid Invite Code')
        return
      } else {
        const userResult = await client.service('user').find({
          query: {
            action: 'invite-code-lookup',
            inviteCode: data.inviteCode
          }
        })
        if (userResult.errors || userResult.code) {
          dispatchAlertError(dispatch, userResult.message)
          return
        }

        if (userResult.total === 0) {
          dispatchAlertError(dispatch, 'No user has that invite code')
          return
        } else {
          data.invitee = userResult.data[0].id
        }
      }
    }

    if (data.invitee != null) {
      if (userIdRegex.test(data.invitee) !== true) {
        dispatchAlertError(dispatch, 'Invalid user ID')
        return
      }
    }

    if ((data.token == null || data.token.length === 0) && (data.invitee == null || data.invitee.length === 0)) {
      dispatchAlertError(dispatch, `Not a valid recipient`)
      return
    }

    try {
      const inviteResult = await client.service('invite').create({
        inviteType: data.type,
        token: data.token,
        inviteCode: data.inviteCode,
        targetObjectId: data.targetObjectId,
        identityProviderType: data.identityProviderType,
        inviteeId: data.invitee
      })

      dispatchAlertSuccess(dispatch, 'Invite Sent')
      dispatch(sentInvite(inviteResult))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
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
    } catch (err) {
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
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeInvite(invite: Invite) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(invite.id)
      dispatch(removedSentInvite())
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function acceptInvite(inviteId: string, passcode: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('a-i').get(inviteId, {
        query: {
          passcode: passcode
        }
      })
      dispatch(acceptedInvite())
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function declineInvite(invite: Invite) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(invite.id)
      dispatch(declinedInvite())
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateInviteTarget(targetObjectType?: string, targetObjectId?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(setInviteTarget(targetObjectType, targetObjectId))
  }
}
if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('invite').on('created', (params) => {
    const invite = params.invite
    const selfUser = (store.getState() as any).get('auth').get('user') as User
    if (invite.userId === selfUser.id) {
      store.dispatch(createdSentInvite())
    } else {
      store.dispatch(createdReceivedInvite())
    }
  })

  client.service('invite').on('removed', (params) => {
    const invite = params.invite
    const selfUser = (store.getState() as any).get('auth').get('user') as User
    if (invite.userId === selfUser.id) {
      store.dispatch(removedSentInvite())
    } else {
      store.dispatch(removedReceivedInvite())
    }
  })
}
