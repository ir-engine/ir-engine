import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { InviteAction } from './InviteActions'
import { Invite } from '@standardcreative/common/src/interfaces/Invite'
import { accessAuthState } from '../../user/state/AuthState'
import { accessInviteState } from './InviteState'
import { Config } from '@standardcreative/common/src/config'
import { AlertService } from '../../common/state/AlertService'
import waitForClientAuthenticated from '../../util/wait-for-client-authenticated'

const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
const inviteCodeRegex = /^[0-9a-fA-F]{8}$/

export const InviteService = {
  sendInvite: async (data: any) => {
    const dispatch = useDispatch()
    {
      if (data.identityProviderType === 'email') {
        if (emailRegex.test(data.token) !== true) {
          AlertService.dispatchAlertError('Invalid email address')
          return
        }
      }
      if (data.identityProviderType === 'sms') {
        if (phoneRegex.test(data.token) !== true) {
          AlertService.dispatchAlertError('Invalid 10-digit US phone number')
          return
        }
      }

      if (data.inviteCode != null) {
        if (inviteCodeRegex.test(data.inviteCode) !== true) {
          AlertService.dispatchAlertError('Invalid Invite Code')
          return
        } else {
          const userResult = await client.service('user').find({
            query: {
              action: 'invite-code-lookup',
              inviteCode: data.inviteCode
            }
          })
          if (userResult.errors || userResult.code) {
            AlertService.dispatchAlertError(userResult.message)
            return
          }

          if (userResult.total === 0) {
            AlertService.dispatchAlertError('No user has that invite code')
            return
          } else {
            data.invitee = userResult.data[0].id
          }
        }
      }

      if (data.invitee != null) {
        if (userIdRegex.test(data.invitee) !== true) {
          AlertService.dispatchAlertError('Invalid user ID')
          return
        }
      }

      if ((data.token == null || data.token.length === 0) && (data.invitee == null || data.invitee.length === 0)) {
        AlertService.dispatchAlertError(`Not a valid recipient`)
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

        AlertService.dispatchAlertSuccess('Invite Sent')
        dispatch(InviteAction.sentInvite(inviteResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  retrieveReceivedInvites: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  retrieveSentInvites: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeInvite: async (invite: Invite) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('invite').remove(invite.id)
        dispatch(InviteAction.removedSentInvite())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  acceptInvite: async (inviteId: string, passcode: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('a-i').get(inviteId, {
          query: {
            passcode: passcode
          }
        })
        dispatch(InviteAction.acceptedInvite())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  declineInvite: async (invite: Invite) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('invite').remove(invite.id)
        dispatch(InviteAction.declinedInvite())
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateInviteTarget: async (targetObjectType?: string, targetObjectId?: string) => {
    const dispatch = useDispatch()
    {
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
