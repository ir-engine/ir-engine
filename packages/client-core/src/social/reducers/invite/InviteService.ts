import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { InviteAction } from './InviteActions'
import { Invite } from '@xrengine/common/src/interfaces/Invite'
import Store from '../../../store'
import { accessAuthState } from '../../../user/reducers/auth/AuthState'
const store = Store.store
import { accessInviteState } from './InviteState'
import { Config } from '@xrengine/common/src/config'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
const inviteCodeRegex = /^[0-9a-fA-F]{8}$/

export const InviteService = {
  sendInvite: (data: any) => {
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
        dispatch(InviteAction.sentInvite(inviteResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  retrieveReceivedInvites: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      dispatch(InviteAction.fetchingReceivedInvites())
      const inviteState = accessInviteState().value
      const skip = inviteState.receivedInvites.skip
      const limit = inviteState.receivedInvites.limit
      try {
        await waitForClientAuthenticated()
        const inviteResult = await client.service('invite').find({
          query: {
            type: 'received',
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(InviteAction.retrievedReceivedInvites(inviteResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  retrieveSentInvites: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      dispatch(InviteAction.fetchingSentInvites())
      const inviteState = accessInviteState().value
      const skip = inviteState.sentInvites.skip
      const limit = inviteState.sentInvites.limit
      try {
        await waitForClientAuthenticated()
        const inviteResult = await client.service('invite').find({
          query: {
            type: 'sent',
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(InviteAction.retrievedSentInvites(inviteResult))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeInvite: (invite: Invite) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('invite').remove(invite.id)
        dispatch(InviteAction.removedSentInvite())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  acceptInvite: (inviteId: string, passcode: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('a-i').get(inviteId, {
          query: {
            passcode: passcode
          }
        })
        dispatch(InviteAction.acceptedInvite())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  declineInvite: (invite: Invite) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('invite').remove(invite.id)
        dispatch(InviteAction.declinedInvite())
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateInviteTarget: (targetObjectType?: string, targetObjectId?: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      dispatch(InviteAction.setInviteTarget(targetObjectType, targetObjectId))
    }
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('invite').on('created', (params) => {
    const invite = params.invite
    const selfUser = accessAuthState().user
    if (invite.userId === selfUser.id.value) {
      store.dispatch(InviteAction.createdSentInvite())
    } else {
      store.dispatch(InviteAction.createdReceivedInvite())
    }
  })

  client.service('invite').on('removed', (params) => {
    const invite = params.invite
    const selfUser = accessAuthState().user
    if (invite.userId === selfUser.id.value) {
      store.dispatch(InviteAction.removedSentInvite())
    } else {
      store.dispatch(InviteAction.removedReceivedInvite())
    }
  })
}
