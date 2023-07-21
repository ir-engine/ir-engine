/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'
import { useEffect } from 'react'

import {
  EMAIL_REGEX,
  INVITE_CODE_REGEX,
  PHONE_REGEX,
  USER_ID_REGEX
} from '@etherealengine/common/src/constants/IdConstants'
import { Invite, SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { Validator, matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { MediaInstanceConnectionAction } from '../../common/services/MediaInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'
import { PartyService } from './PartyService'

//State
export const INVITE_PAGE_LIMIT = 100

export const InviteState = defineState({
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
  const s = getMutableState(InviteState)
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

//Service
export const InviteService = {
  sendInvite: async (data: SendInvite) => {
    if (data.identityProviderType === 'email') {
      if (!data.token || !EMAIL_REGEX.test(data.token)) {
        NotificationService.dispatchNotify(`Invalid email address: ${data.token}`, { variant: 'error' })
        return
      }
    }

    if (data.identityProviderType === 'sms') {
      if (!data.token || !PHONE_REGEX.test(data.token)) {
        NotificationService.dispatchNotify(`Invalid 10-digit US phone number: ${data.token}`, { variant: 'error' })
        return
      }
    }

    if (data.token && !data.identityProviderType) {
      NotificationService.dispatchNotify(`Invalid value: ${data.token}`, { variant: 'error' })
      return
    }

    if (data.inviteCode != null) {
      if (!INVITE_CODE_REGEX.test(data.inviteCode)) {
        NotificationService.dispatchNotify(`Invalid Invite Code: ${data.inviteCode}`, { variant: 'error' })
        return
      } else {
        try {
          const userResult = (await Engine.instance.api.service('user').find({
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
      if (!USER_ID_REGEX.test(data.inviteeId)) {
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

      const existingInviteResult = (await Engine.instance.api.service('invite').find({
        query: params
      })) as Paginated<Invite>

      let inviteResult
      if (existingInviteResult.total === 0) inviteResult = await Engine.instance.api.service('invite').create(params)

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
    const inviteState = getState(InviteState)
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
      const inviteResult = (await Engine.instance.api.service('invite').find({
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
    const inviteState = getState(InviteState)
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
      const inviteResult = (await Engine.instance.api.service('invite').find({
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
      await Engine.instance.api.service('invite').remove(inviteId)
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
      await Engine.instance.api.service('a-i').get(invite.id, {
        query: {
          passcode: invite.passcode
        }
      })
      if (invite.inviteType === 'party') await PartyService.leaveNetwork(false)
      dispatchAction(InviteAction.acceptedInvite({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  declineInvite: async (invite: Invite) => {
    try {
      await Engine.instance.api.service('invite').remove(invite.id)
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
        const invite = params
        const selfUser = getState(AuthState).user
        if (invite.userId === selfUser.id) {
          dispatchAction(InviteAction.createdSentInvite({}))
        } else {
          dispatchAction(InviteAction.createdReceivedInvite({}))
        }
      }

      const inviteRemovedListener = (params) => {
        const invite = params
        const selfUser = getState(AuthState).user
        if (invite.userId === selfUser.id) {
          dispatchAction(InviteAction.removedSentInvite({}))
        } else {
          dispatchAction(InviteAction.removedReceivedInvite({}))
        }
      }

      Engine.instance.api.service('invite').on('created', inviteCreatedListener)
      Engine.instance.api.service('invite').on('removed', inviteRemovedListener)

      return () => {
        Engine.instance.api.service('invite').off('created', inviteCreatedListener)
        Engine.instance.api.service('invite').off('removed', inviteRemovedListener)
      }
    }, [])
  }
}

//Action
export class InviteAction {
  static sentInvite = defineAction({
    type: 'ee.client.Invite.INVITE_SENT' as const,
    id: matches.string
  })

  static retrievedSentInvites = defineAction({
    type: 'ee.client.Invite.SENT_INVITES_RETRIEVED' as const,
    invites: matches.array as Validator<unknown, Invite[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static retrievedReceivedInvites = defineAction({
    type: 'ee.client.Invite.RECEIVED_INVITES_RETRIEVED' as const,
    invites: matches.array as Validator<unknown, Invite[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static createdReceivedInvite = defineAction({
    type: 'ee.client.Invite.CREATED_RECEIVED_INVITE' as const
  })

  static removedReceivedInvite = defineAction({
    type: 'ee.client.Invite.REMOVED_RECEIVED_INVITE' as const
  })

  static createdSentInvite = defineAction({
    type: 'ee.client.Invite.CREATED_SENT_INVITE' as const
  })

  static removedSentInvite = defineAction({
    type: 'ee.client.Invite.REMOVED_SENT_INVITE' as const
  })

  static acceptedInvite = defineAction({
    type: 'ee.client.Invite.ACCEPTED_INVITE' as const
  })

  static declinedInvite = defineAction({
    type: 'ee.client.Invite.DECLINED_INVITE' as const
  })

  static setInviteTarget = defineAction({
    type: 'ee.client.Invite.INVITE_TARGET_SET' as const,
    targetObjectId: matches.string,
    targetObjectType: matches.string
  })

  static fetchingSentInvites = defineAction({
    type: 'ee.client.Invite.FETCHING_SENT_INVITES' as const
  })

  static fetchingReceivedInvites = defineAction({
    type: 'ee.client.Invite.FETCHING_RECEIVED_INVITES' as const
  })
}
