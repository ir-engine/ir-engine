import { Paginated } from '@feathersjs/feathers'

import { Invite as InviteInterface } from '@xrengine/common/src/interfaces/Invite'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'
import { InviteDataType } from '@xrengine/server-core/src/hooks/send-invite'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessInviteState, InviteAction } from '../../social/services/InviteService'

const logger = multiLogger.child({ component: 'client-core:InviteService' })

//State
export const INVITE_PAGE_LIMIT = 100

const AdminInviteState = defineState({
  name: 'AdminInviteState',
  initial: () => ({
    invites: [] as Array<InviteInterface>,
    skip: 0,
    limit: INVITE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    created: false,
    lastFetched: Date.now()
  })
})

export const invitesRetrievedReceptor = (action: typeof AdminInviteActions.invitesRetrieved.matches._TYPE) => {
  const state = getState(AdminInviteState)
  return state.merge({
    invites: action.invites.data,
    skip: action.invites.skip,
    limit: action.invites.limit,
    total: action.invites.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

export const inviteCreatedReceptor = (action: typeof AdminInviteActions.inviteCreated.matches._TYPE) => {
  const state = getState(AdminInviteState)
  return state.merge({ updateNeeded: true, created: true })
}

export const invitePatchedReceptor = (action: typeof AdminInviteActions.invitePatched.matches._TYPE) => {
  const state = getState(AdminInviteState)
  return state.merge({ updateNeeded: true })
}

export const inviteRemovedReceptor = (action: typeof AdminInviteActions.inviteRemoved.matches._TYPE) => {
  const state = getState(AdminInviteState)
  return state.merge({ updateNeeded: true })
}

export const AdminInviteReceptors = {
  invitesRetrievedReceptor,
  inviteCreatedReceptor,
  invitePatchedReceptor,
  inviteRemovedReceptor
}

export const accessAdminInviteState = () => getState(AdminInviteState)

export const useAdminInviteState = () => useState(accessAdminInviteState())

//Service
export const AdminInviteService = {
  updateInvite: async (id: string, invite: InviteInterface) => {
    try {
      const result = await API.instance.client.service('invite').update(id, invite)
      dispatchAction(AdminInviteActions.invitePatched({ invite: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeInvite: async (id: string) => {
    const result = (await API.instance.client.service('invite').remove(id)) as InviteInterface
    dispatchAction(AdminInviteActions.inviteRemoved({ invite: result }))
  },
  createInvite: async (invite: any) => {
    try {
      const result = await API.instance.client.service('invite').create(invite)
      dispatchAction(AdminInviteActions.inviteCreated({ invite: result as InviteDataType }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchAdminInvites: async (
    incDec?: 'increment' | 'decrement',
    search?: string,
    sortField = 'id',
    orderBy = 'asc',
    value: string | null = null
  ) => {
    try {
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
      const invites = (await API.instance.client.service('invite').find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * INVITE_PAGE_LIMIT,
          $limit: limit
          // search: value
        }
      })) as Paginated<InviteInterface>
      dispatchAction(AdminInviteActions.invitesRetrieved({ invites }))
    } catch (error) {
      logger.error(error)
    }
  },
  searchAdminInvites: async (value, orderBy = 'asc') => {
    try {
      const invites = (await API.instance.client.service('invite').find({
        query: {
          search: value,
          $sort: {
            name: orderBy === 'desc' ? 0 : 1
          },
          $skip: accessAdminInviteState().skip.value,
          $limit: accessAdminInviteState().limit.value
        }
      })) as Paginated<InviteInterface>
    } catch (error) {
      logger.error(error)
    }
  }
}

//Action
export class AdminInviteActions {
  static invitesRetrieved = defineAction({
    type: 'xre.client.AdminInvite.ADMIN_INVITES_RETRIEVED' as const,
    invites: matches.object as Validator<unknown, Paginated<InviteInterface>>
  })

  static inviteCreated = defineAction({
    type: 'xre.client.AdminInvite.ADMIN_INVITE_CREATED' as const,
    invite: matches.object as Validator<unknown, InviteInterface>
  })

  static invitePatched = defineAction({
    type: 'xre.client.AdminInvite.ADMIN_INVITE_PATCHED' as const,
    invite: matches.object as Validator<unknown, InviteInterface>
  })

  static inviteRemoved = defineAction({
    type: 'xre.client.AdminInvite.ADMIN_INVITE_REMOVED' as const,
    invite: matches.object as Validator<unknown, InviteInterface>
  })
}
