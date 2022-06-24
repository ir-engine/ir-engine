import { Paginated } from '@feathersjs/feathers'
import { useEffect } from 'react'

import { Invite, SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { User } from '@xrengine/common/src/interfaces/User'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'

const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
const inviteCodeRegex = /^[0-9a-fA-F]{8}$/

//State
export const INVITE_PAGE_LIMIT = 100

const InviteState = defineState({
  name: 'InviteState',
  initial: () => ({
    receivedInvites: {
      invites: [] as Array<Invite>,
      skip: 0,
      limit: 100,
      total: 0
    },
    sentInvites: {
      invites: [] as Array<Invite>,
      skip: 0,
      limit: 100,
      total: 0
    },
    sentUpdateNeeded: true,
    receivedUpdateNeeded: true,
    getSentInvitesInProgress: false,
    getReceivedInvitesInProgress: false,
    targetObjectId: '',
    targetObjectType: ''
  })
})

export const InviteServiceReceptor = (action) => {
  getState(InviteState).batch((s) => {
    matches(InviteState)
      .when(InviteAction.sentInvite.matches, () => {
        return s.sentUpdateNeeded.set(true)
      })
      .when(InviteAction.retrievedSentInvites.matches, (action) => {
        return s.merge({
          sentInvites: {
            invites: action.invites,
            skip: action.skip,
            limit: action.limit,
            total: action.total
          },
          sentUpdateNeeded: false,
          getSentInvitesInProgress: false
        })
      })
      .when(InviteAction.retrievedReceivedInvites.matches, (action) => {
        return s.merge({
          receivedInvites: {
            invites: action.invites,
            skip: action.skip,
            limit: action.limit,
            total: action.total
          },
          receivedUpdateNeeded: false,
          getReceivedInvitesInProgress: false
        })
      })
      .when(InviteAction.createdReceivedInvite.matches, () => {
        return s.receivedUpdateNeeded.set(true)
      })
      .when(InviteAction.createdSentInvite.matches, () => {
        return s.receivedUpdateNeeded.set(true)
      })
      .when(InviteAction.removedReceivedInvite.matches, () => {
        return s.receivedUpdateNeeded.set(true)
      })
      .when(InviteAction.removedSentInvite.matches, () => {
        return s.sentUpdateNeeded.set(true)
      })
      .when(InviteAction.acceptedInvite.matches, () => {
        return s.receivedUpdateNeeded.set(true)
      })
      .when(InviteAction.declinedInvite.matches, () => {
        return s.receivedUpdateNeeded.set(true)
      })
      .when(InviteAction.setInviteTarget.matches, (action) => {
        return s.merge({
          targetObjectId: action.targetObjectId || '',
          targetObjectType: action.targetObjectType || ''
        })
      })
      .when(InviteAction.fetchingSentInvites.matches, () => {
        return s.getSentInvitesInProgress.set(true)
      })
      .when(InviteAction.fetchingReceivedInvites.matches, () => {
        return s.getReceivedInvitesInProgress.set(true)
      })
  })
}

export const accessInviteState = () => getState(InviteState)

export const useInviteState = () => useState(accessInviteState())

//Service
export const InviteService = {
  sendInvite: async (data: SendInvite) => {
    if (data.identityProviderType === 'email') {
      if (emailRegex.test(data.token) !== true) {
        NotificationService.dispatchNotify('Invalid email address', { variant: 'error' })
        return
      }
    }
    if (data.identityProviderType === 'sms') {
      if (phoneRegex.test(data.token) !== true) {
        NotificationService.dispatchNotify('Invalid 10-digit US phone number', { variant: 'error' })
        return
      }
    }

    if (data.inviteCode != null) {
      if (!inviteCodeRegex.test(data.inviteCode)) {
        NotificationService.dispatchNotify('Invalid Invite Code', { variant: 'error' })
        return
      } else {
        try {
          const userResult = (await API.instance.client.service('user').find({
            query: {
              action: 'invite-code-lookup',
              inviteCode: data.inviteCode
            }
          })) as Paginated<User>

          if (userResult.total === 0) {
            NotificationService.dispatchNotify('No user has that invite code', { variant: 'error' })
            return
          }
        } catch (err) {
          NotificationService.dispatchNotify(err.message, { variant: 'error' })
        }
      }
    }

    if (data.invitee != null) {
      if (userIdRegex.test(data.invitee) !== true) {
        NotificationService.dispatchNotify('Invalid user ID', { variant: 'error' })
        return
      }
    }

    if ((data.token == null || data.token.length === 0) && (data.invitee == null || data.invitee.length === 0)) {
      NotificationService.dispatchNotify('Not a valid recipient', { variant: 'error' })
      return
    }

    try {
      const params = {
        inviteType: data.type,
        token: data.token,
        targetObjectId: data.targetObjectId,
        identityProviderType: data.identityProviderType,
        inviteeId: data.invitee
      }

      const existingInviteResult = (await API.instance.client.service('invite').find({
        query: params
      })) as Paginated<Invite>

      let inviteResult
      if (existingInviteResult.total === 0) inviteResult = await API.instance.client.service('invite').create(params)

      NotificationService.dispatchNotify('Invite Sent', { variant: 'success' })
      dispatchAction(InviteAction.sentInvite({ id: inviteResult }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  retrieveReceivedInvites: async (
    incDec?: 'increment' | 'decrement',
    search?: string,
    sortField = 'id',
    orderBy = 'asc'
  ) => {
    dispatchAction(InviteAction.fetchingReceivedInvites())
    const inviteState = accessInviteState().value
    const skip = inviteState.receivedInvites.skip
    const limit = inviteState.receivedInvites.limit
    let sortData = {}
    if (sortField.length > 0) {
      if (sortField === 'type') {
        sortData['inviteType'] = orderBy === 'desc' ? -1 : 1
      } else if (sortField === 'name') {
        // TO DO; need to find the proper syntax if that's possible
        // sortData[`'user.name'`] = orderBy === 'desc' ? -1 : 1
      } else {
        sortData[sortField] = orderBy === 'desc' ? -1 : 1
      }
    }

    try {
      const inviteResult = (await API.instance.client.service('invite').find({
        query: {
          $sort: sortData,
          type: 'received',
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          $limit: limit,
          search: search
        }
      })) as Paginated<Invite>
      dispatchAction(
        InviteAction.retrievedReceivedInvites({
          invites: inviteResult.data,
          total: inviteResult.total,
          skip: inviteResult.skip,
          limit: inviteResult.limit
        })
      )
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  retrieveSentInvites: async (
    incDec?: 'increment' | 'decrement',
    search?: string,
    sortField = 'id',
    orderBy = 'asc'
  ) => {
    dispatchAction(InviteAction.fetchingSentInvites())
    const inviteState = accessInviteState().value
    const skip = inviteState.sentInvites.skip
    const limit = inviteState.sentInvites.limit
    let sortData = {}
    if (sortField.length > 0) {
      if (sortField === 'type') {
        sortData['inviteType'] = orderBy === 'desc' ? -1 : 1
      } else if (sortField === 'name') {
        // TO DO; need to find the proper syntax if that's possible
        // sortData[`'invitee.name'`] = orderBy === 'desc' ? -1 : 1
      } else {
        sortData[sortField] = orderBy === 'desc' ? -1 : 1
      }
    }
    try {
      const inviteResult = (await API.instance.client.service('invite').find({
        query: {
          $sort: sortData,
          type: 'sent',
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          $limit: limit,
          search: search
        }
      })) as Paginated<Invite>
      dispatchAction(
        InviteAction.retrievedSentInvites({
          invites: inviteResult.data,
          total: inviteResult.total,
          skip: inviteResult.skip,
          limit: inviteResult.limit
        })
      )
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeInvite: async (inviteId: string) => {
    try {
      await API.instance.client.service('invite').remove(inviteId)
      dispatchAction(InviteAction.removedSentInvite())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  acceptInvite: async (inviteId: string, passcode: string) => {
    try {
      await API.instance.client.service('a-i').get(inviteId, {
        query: {
          passcode: passcode
        }
      })
      dispatchAction(InviteAction.acceptedInvite())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  declineInvite: async (invite: Invite) => {
    try {
      await API.instance.client.service('invite').remove(invite.id)
      dispatchAction(InviteAction.declinedInvite())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  updateInviteTarget: async (targetObjectType: string, targetObjectId: string) => {
    dispatchAction(InviteAction.setInviteTarget({ targetObjectType, targetObjectId }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const inviteCreatedListener = (params) => {
        const invite = params.invite
        const selfUser = accessAuthState().user
        if (invite.userId === selfUser.id.value) {
          dispatchAction(InviteAction.createdSentInvite())
        } else {
          dispatchAction(InviteAction.createdReceivedInvite())
        }
      }

      const inviteRemovedListener = (params) => {
        const invite = params.invite
        const selfUser = accessAuthState().user
        if (invite.userId === selfUser.id.value) {
          dispatchAction(InviteAction.removedSentInvite())
        } else {
          dispatchAction(InviteAction.removedReceivedInvite())
        }
      }

      API.instance.client.service('invite').on('created', inviteCreatedListener)
      API.instance.client.service('invite').on('removed', inviteRemovedListener)

      return () => {
        API.instance.client.service('invite').off('created', inviteCreatedListener)
        API.instance.client.service('invite').off('removed', inviteRemovedListener)
      }
    }, [])
  }
}

//Action
export class InviteAction {
  static sentInvite = defineAction({
    type: 'INVITE_SENT' as const,
    id: matches.string
  })

  static retrievedSentInvites = defineAction({
    type: 'SENT_INVITES_RETRIEVED' as const,
    invites: matches.array as Validator<unknown, Invite[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static retrievedReceivedInvites = defineAction({
    type: 'RECEIVED_INVITES_RETRIEVED' as const,
    invites: matches.array as Validator<unknown, Invite[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static createdReceivedInvite = defineAction({
    type: 'CREATED_RECEIVED_INVITE' as const
  })

  static removedReceivedInvite = defineAction({
    type: 'REMOVED_RECEIVED_INVITE' as const
  })

  static createdSentInvite = defineAction({
    type: 'CREATED_SENT_INVITE' as const
  })

  static removedSentInvite = defineAction({
    type: 'REMOVED_SENT_INVITE' as const
  })

  static acceptedInvite = defineAction({
    type: 'ACCEPTED_INVITE' as const
  })

  static declinedInvite = defineAction({
    type: 'DECLINED_INVITE' as const
  })

  static setInviteTarget = defineAction({
    type: 'INVITE_TARGET_SET' as const,
    targetObjectId: matches.string,
    targetObjectType: matches.string
  })

  static fetchingSentInvites = defineAction({
    type: 'FETCHING_SENT_INVITES' as const
  })

  static fetchingReceivedInvites = defineAction({
    type: 'FETCHING_RECEIVED_INVITES' as const
  })
}
