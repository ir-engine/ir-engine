import { Paginated } from '@feathersjs/feathers'
import { useEffect } from 'react'

import { Invite, SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { MediaInstanceConnectionAction } from '../../common/services/MediaInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'
import { PartyService } from './PartyService'

export const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
export const phoneRegex = /^[0-9]{10}$/
export const userIdRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
export const inviteCodeRegex = /^[0-9a-fA-F]{8}$/

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
  const s = getState(InviteState)
  matches(action)
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
}

export const accessInviteState = () => getState(InviteState)

export const useInviteState = () => useState(accessInviteState())

//Service
export const InviteService = {
  sendInvite: async (data: SendInvite) => {
    if (data.identityProviderType === 'email') {
      if (!data.token || !emailRegex.test(data.token)) {
        NotificationService.dispatchNotify(`Invalid email address: ${data.token}`, { variant: 'error' })
        return
      }
    }

    if (data.identityProviderType === 'sms') {
      if (!data.token || !phoneRegex.test(data.token)) {
        NotificationService.dispatchNotify(`Invalid 10-digit US phone number: ${data.token}`, { variant: 'error' })
        return
      }
    }

    if (data.token && !data.identityProviderType) {
      NotificationService.dispatchNotify(`Invalid value: ${data.token}`, { variant: 'error' })
      return
    }

    if (data.inviteCode != null) {
      if (!inviteCodeRegex.test(data.inviteCode)) {
        NotificationService.dispatchNotify(`Invalid Invite Code: ${data.inviteCode}`, { variant: 'error' })
        return
      } else {
        try {
          const userResult = (await API.instance.client.service('user').find({
            query: {
              action: 'invite-code-lookup',
              inviteCode: data.inviteCode
            }
          })) as Paginated<UserInterface>

          if (userResult.total === 0) {
            NotificationService.dispatchNotify(`No user has the invite code ${data.inviteCode}`, { variant: 'error' })
            return
          }
          data.inviteeId = userResult.data[0].id
        } catch (err) {
          NotificationService.dispatchNotify(err.message, { variant: 'error' })
        }
      }
    }

    if (data.inviteeId != null) {
      if (!userIdRegex.test(data.inviteeId)) {
        NotificationService.dispatchNotify('Invalid user ID', { variant: 'error' })
        return
      }
    }

    if ((data.token == null || data.token.length === 0) && (data.inviteeId == null || data.inviteeId.length === 0)) {
      NotificationService.dispatchNotify('Not a valid recipient', { variant: 'error' })
      return
    }

    try {
      const params = {
        inviteType: data.inviteType,
        token: data.token,
        targetObjectId: data.targetObjectId,
        identityProviderType: data.identityProviderType,
        inviteeId: data.inviteeId,
        makeAdmin: data.makeAdmin,
        deleteOnUse: data.deleteOnUse,
        spawnType: data.spawnType,
        spawnDetails: data.spawnDetails,
        timed: data.timed,
        startTime: data.startTime,
        endTime: data.endTime,
        existenceCheck: true
      }

      const existingInviteResult = (await API.instance.client.service('invite').find({
        query: params
      })) as Paginated<Invite>

      let inviteResult
      if (existingInviteResult.total === 0) inviteResult = await API.instance.client.service('invite').create(params)

      NotificationService.dispatchNotify('Invite Sent', { variant: 'success' })
      dispatchAction(
        InviteAction.sentInvite({
          id: existingInviteResult.total > 0 ? existingInviteResult.data[0].id : inviteResult.id
        })
      )
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
    dispatchAction(InviteAction.fetchingReceivedInvites({}))
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
    dispatchAction(InviteAction.fetchingSentInvites({}))
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
      dispatchAction(InviteAction.removedSentInvite({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  acceptInvite: async (invite: Invite) => {
    try {
      if (invite.inviteType === 'party') {
        dispatchAction(MediaInstanceConnectionAction.joiningNonInstanceMediaChannel({}))
      }
      await API.instance.client.service('a-i').get(invite.id, {
        query: {
          passcode: invite.passcode
        }
      })
      if (invite.inviteType === 'party') PartyService.leaveNetwork(false)
      dispatchAction(InviteAction.acceptedInvite({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  declineInvite: async (invite: Invite) => {
    try {
      await API.instance.client.service('invite').remove(invite.id)
      dispatchAction(InviteAction.declinedInvite({}))
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
          dispatchAction(InviteAction.createdSentInvite({}))
        } else {
          dispatchAction(InviteAction.createdReceivedInvite({}))
        }
      }

      const inviteRemovedListener = (params) => {
        const invite = params.invite
        const selfUser = accessAuthState().user
        if (invite.userId === selfUser.id.value) {
          dispatchAction(InviteAction.removedSentInvite({}))
        } else {
          dispatchAction(InviteAction.removedReceivedInvite({}))
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
    type: 'xre.client.Invite.INVITE_SENT' as const,
    id: matches.string
  })

  static retrievedSentInvites = defineAction({
    type: 'xre.client.Invite.SENT_INVITES_RETRIEVED' as const,
    invites: matches.array as Validator<unknown, Invite[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static retrievedReceivedInvites = defineAction({
    type: 'xre.client.Invite.RECEIVED_INVITES_RETRIEVED' as const,
    invites: matches.array as Validator<unknown, Invite[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static createdReceivedInvite = defineAction({
    type: 'xre.client.Invite.CREATED_RECEIVED_INVITE' as const
  })

  static removedReceivedInvite = defineAction({
    type: 'xre.client.Invite.REMOVED_RECEIVED_INVITE' as const
  })

  static createdSentInvite = defineAction({
    type: 'xre.client.Invite.CREATED_SENT_INVITE' as const
  })

  static removedSentInvite = defineAction({
    type: 'xre.client.Invite.REMOVED_SENT_INVITE' as const
  })

  static acceptedInvite = defineAction({
    type: 'xre.client.Invite.ACCEPTED_INVITE' as const
  })

  static declinedInvite = defineAction({
    type: 'xre.client.Invite.DECLINED_INVITE' as const
  })

  static setInviteTarget = defineAction({
    type: 'xre.client.Invite.INVITE_TARGET_SET' as const,
    targetObjectId: matches.string,
    targetObjectType: matches.string
  })

  static fetchingSentInvites = defineAction({
    type: 'xre.client.Invite.FETCHING_SENT_INVITES' as const
  })

  static fetchingReceivedInvites = defineAction({
    type: 'xre.client.Invite.FETCHING_RECEIVED_INVITES' as const
  })
}
