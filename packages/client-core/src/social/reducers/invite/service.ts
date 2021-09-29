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
import { accessAuthState } from '../../../user/reducers/auth/AuthState'
const store = Store.store

import { Config } from '@xrengine/common/src/config'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
const inviteCodeRegex = /^[0-9a-fA-F]{8}$/

export function sendInvite(data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    if (data.identityProviderType === 'email') {
      if (emailRegex.test(data.token) !== true) {
        AlertService.dispatchAlertError(dispatch, 'Invalid email address')
        return
      }
    }
    if (data.identityProviderType === 'sms') {
      if (phoneRegex.test(data.token) !== true) {
        AlertService.dispatchAlertError(dispatch, 'Invalid 10-digit US phone number')
        return
      }
    }

    if (data.inviteCode != null) {
      if (inviteCodeRegex.test(data.inviteCode) !== true) {
        AlertService.dispatchAlertError(dispatch, 'Invalid Invite Code')
        return
      } else {
        const userResult = await client.service('user').find({
          query: {
            action: 'invite-code-lookup',
            inviteCode: data.inviteCode
          }
        })
        if (userResult.errors || userResult.code) {
          AlertService.dispatchAlertError(dispatch, userResult.message)
          return
        }

        if (userResult.total === 0) {
          AlertService.dispatchAlertError(dispatch, 'No user has that invite code')
          return
        } else {
          data.invitee = userResult.data[0].id
        }
      }
    }

    if (data.invitee != null) {
      if (userIdRegex.test(data.invitee) !== true) {
        AlertService.dispatchAlertError(dispatch, 'Invalid user ID')
        return
      }
    }

    if ((data.token == null || data.token.length === 0) && (data.invitee == null || data.invitee.length === 0)) {
      AlertService.dispatchAlertError(dispatch, `Not a valid recipient`)
      return
    }

    try {
      const params = {
        inviteType: data.type,
        token: data.token,
        inviteCode: data.inviteCode,
        targetObjectId: data.targetObjectId,
        identityProviderType: data.identityProviderType,
        inviteeId: data.invitee
      }

      const existingInviteResult = await client.service('invite').find(params)

      let inviteResult
      if (existingInviteResult.total === 0) inviteResult = await client.service('invite').create(params)

      AlertService.dispatchAlertSuccess(dispatch, 'Invite Sent')
      dispatch(sentInvite(inviteResult))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function retrieveReceivedInvites(incDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingReceivedInvites())
    const skip = getState().get('invite').get('receivedInvites').get('skip')
    const limit = getState().get('invite').get('receivedInvites').get('limit')
    try {
      await waitForClientAuthenticated()
      const inviteResult = await client.service('invite').find({
        query: {
          type: 'received',
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          $limit: limit
        }
      })
      dispatch(retrievedReceivedInvites(inviteResult))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function retrieveSentInvites(incDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingSentInvites())
    const skip = getState().get('invite').get('sentInvites').get('skip')
    const limit = getState().get('invite').get('sentInvites').get('limit')
    try {
      await waitForClientAuthenticated()
      const inviteResult = await client.service('invite').find({
        query: {
          type: 'sent',
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          $limit: limit
        }
      })
      dispatch(retrievedSentInvites(inviteResult))
    } catch (err) {
      AlertService.dispatchAlertError(dispatch, err.message)
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
      AlertService.dispatchAlertError(dispatch, err.message)
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
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function declineInvite(invite: Invite) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(invite.id)
      dispatch(declinedInvite())
    } catch (err) {
      AlertService.dispatchAlertError(dispatch, err.message)
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
    const selfUser = accessAuthState().user
    if (invite.userId === selfUser.id.value) {
      store.dispatch(createdSentInvite())
    } else {
      store.dispatch(createdReceivedInvite())
    }
  })

  client.service('invite').on('removed', (params) => {
    const invite = params.invite
    const selfUser = accessAuthState().user
    if (invite.userId === selfUser.id.value) {
      store.dispatch(removedSentInvite())
    } else {
      store.dispatch(removedReceivedInvite())
    }
  })
}
