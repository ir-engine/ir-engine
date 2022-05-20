import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { Invite, SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { InviteResult } from '@xrengine/common/src/interfaces/InviteResult'
import { User } from '@xrengine/common/src/interfaces/User'

import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'

const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
const userIdRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
const inviteCodeRegex = /^[0-9a-fA-F]{8}$/

//State
export const INVITE_PAGE_LIMIT = 100

const state = createState({
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

store.receptors.push((action: InviteActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'INVITE_SENT':
        return s.sentUpdateNeeded.set(true)
      case 'SENT_INVITES_RETRIEVED':
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
      case 'RECEIVED_INVITES_RETRIEVED':
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
      case 'CREATED_RECEIVED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'CREATED_SENT_INVITE':
        return s.sentUpdateNeeded.set(true)
      case 'REMOVED_RECEIVED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'REMOVED_SENT_INVITE':
        return s.sentUpdateNeeded.set(true)
      case 'ACCEPTED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'DECLINED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'INVITE_TARGET_SET':
        return state.merge({
          targetObjectId: action.targetObjectId || '',
          targetObjectType: action.targetObjectType || ''
        })
      case 'FETCHING_SENT_INVITES':
        return s.getSentInvitesInProgress.set(true)
      case 'FETCHING_RECEIVED_INVITES':
        return s.getReceivedInvitesInProgress.set(true)
    }
  }, action.type)
})

export const accessInviteState = () => state

export const useInviteState = () => useState(state) as any as typeof state

//Service
export const InviteService = {
  sendInvite: async (data: SendInvite) => {
    const dispatch = useDispatch()

    if (data.identityProviderType === 'email') {
      if (emailRegex.test(data.token) !== true) {
        AlertService.dispatchAlertError(new Error('Invalid email address'))
        return
      }
    }
    if (data.identityProviderType === 'sms') {
      if (phoneRegex.test(data.token) !== true) {
        AlertService.dispatchAlertError(new Error('Invalid 10-digit US phone number'))
        return
      }
    }

    if (data.inviteCode != null) {
      if (!inviteCodeRegex.test(data.inviteCode)) {
        AlertService.dispatchAlertError(new Error('Invalid Invite Code'))
        return
      } else {
        try {
          const userResult = (await client.service('user').find({
            query: {
              action: 'invite-code-lookup',
              inviteCode: data.inviteCode
            }
          })) as Paginated<User>

          if (userResult.total === 0) {
            AlertService.dispatchAlertError(new Error('No user has that invite code'))
            return
          }
        } catch (error) {
          AlertService.dispatchAlertError(error)
        }
      }
    }

    if (data.invitee != null) {
      if (userIdRegex.test(data.invitee) !== true) {
        AlertService.dispatchAlertError(new Error('Invalid user ID'))
        return
      }
    }

    if ((data.token == null || data.token.length === 0) && (data.invitee == null || data.invitee.length === 0)) {
      AlertService.dispatchAlertError(new Error(`Not a valid recipient`))
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

      const existingInviteResult = (await client.service('invite').find({
        query: params
      })) as Paginated<Invite>

      let inviteResult
      if (existingInviteResult.total === 0) inviteResult = await client.service('invite').create(params)

      AlertService.dispatchAlertSuccess('Invite Sent')
      dispatch(InviteAction.sentInvite(inviteResult))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  retrieveReceivedInvites: async (
    incDec?: 'increment' | 'decrement',
    search?: string,
    sortField = 'id',
    orderBy = 'asc'
  ) => {
    const dispatch = useDispatch()

    dispatch(InviteAction.fetchingReceivedInvites())
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
      const inviteResult = (await client.service('invite').find({
        query: {
          $sort: sortData,
          type: 'received',
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          $limit: limit,
          search: search
        }
      })) as Paginated<Invite>
      dispatch(InviteAction.retrievedReceivedInvites(inviteResult))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  retrieveSentInvites: async (
    incDec?: 'increment' | 'decrement',
    search?: string,
    sortField = 'id',
    orderBy = 'asc'
  ) => {
    const dispatch = useDispatch()

    dispatch(InviteAction.fetchingSentInvites())
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
      const inviteResult = (await client.service('invite').find({
        query: {
          $sort: sortData,
          type: 'sent',
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          $limit: limit,
          search: search
        }
      })) as Paginated<Invite>
      dispatch(InviteAction.retrievedSentInvites(inviteResult))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  removeInvite: async (inviteId: string) => {
    const dispatch = useDispatch()

    try {
      await client.service('invite').remove(inviteId)
      dispatch(InviteAction.removedSentInvite())
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  acceptInvite: async (inviteId: string, passcode: string) => {
    const dispatch = useDispatch()

    try {
      await client.service('a-i').get(inviteId, {
        query: {
          passcode: passcode
        }
      })
      dispatch(InviteAction.acceptedInvite())
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  declineInvite: async (invite: Invite) => {
    const dispatch = useDispatch()

    try {
      await client.service('invite').remove(invite.id)
      dispatch(InviteAction.declinedInvite())
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  updateInviteTarget: async (targetObjectType?: string, targetObjectId?: string) => {
    const dispatch = useDispatch()

    dispatch(InviteAction.setInviteTarget(targetObjectType, targetObjectId))
  }
}

if (globalThis.process.env['VITE_OFFLINE_MODE'] !== 'true') {
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

//Action
export const InviteAction = {
  sentInvite: (id: string) => {
    return {
      type: 'INVITE_SENT' as const,
      id
    }
  },
  retrievedSentInvites: (inviteResult: InviteResult) => {
    return {
      type: 'SENT_INVITES_RETRIEVED' as const,
      invites: inviteResult.data,
      total: inviteResult.total,
      limit: inviteResult.limit,
      skip: inviteResult.skip
    }
  },
  retrievedReceivedInvites: (inviteResult: Paginated<Invite>) => {
    return {
      type: 'RECEIVED_INVITES_RETRIEVED' as const,
      invites: inviteResult.data,
      total: inviteResult.total,
      limit: inviteResult.limit,
      skip: inviteResult.skip
    }
  },
  createdReceivedInvite: () => {
    return {
      type: 'CREATED_RECEIVED_INVITE' as const
    }
  },
  removedReceivedInvite: () => {
    return {
      type: 'REMOVED_RECEIVED_INVITE' as const
    }
  },
  createdSentInvite: () => {
    return {
      type: 'CREATED_SENT_INVITE' as const
    }
  },
  removedSentInvite: () => {
    return {
      type: 'REMOVED_SENT_INVITE' as const
    }
  },
  acceptedInvite: () => {
    return {
      type: 'ACCEPTED_INVITE' as const
    }
  },
  declinedInvite: () => {
    return {
      type: 'DECLINED_INVITE' as const
    }
  },
  setInviteTarget: (targetObjectType?: string, targetObjectId?: string) => {
    return {
      type: 'INVITE_TARGET_SET' as const,
      targetObjectId: targetObjectId,
      targetObjectType: targetObjectType
    }
  },
  fetchingSentInvites: () => {
    return {
      type: 'FETCHING_SENT_INVITES' as const
    }
  },
  fetchingReceivedInvites: () => {
    return {
      type: 'FETCHING_RECEIVED_INVITES' as const
    }
  }
}

export type InviteActionType = ReturnType<typeof InviteAction[keyof typeof InviteAction]>
