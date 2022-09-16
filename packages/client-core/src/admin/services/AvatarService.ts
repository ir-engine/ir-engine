import { Paginated } from '@feathersjs/feathers'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AvatarResult } from '@xrengine/common/src/interfaces/AvatarResult'
import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:AvatarService' })

//State
export const AVATAR_PAGE_LIMIT = 100

const AdminAvatarState = defineState({
  name: 'AdminAvatarState',
  initial: () => ({
    avatars: [] as Array<AvatarInterface>,
    thumbnail: undefined as StaticResourceInterface | undefined,
    skip: 0,
    limit: AVATAR_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const avatarsFetchedReceptor = (action: typeof AdminAvatarActions.avatarsFetched.matches._TYPE) => {
  const state = getState(AdminAvatarState)
  return state.merge({
    avatars: action.avatars.data,
    skip: action.avatars.skip,
    limit: action.avatars.limit,
    total: action.avatars.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const avatarCreatedReceptor = (action: typeof AdminAvatarActions.avatarCreated.matches._TYPE) => {
  const state = getState(AdminAvatarState)
  return state.merge({ updateNeeded: true })
}

const avatarRemovedReceptor = (action: typeof AdminAvatarActions.avatarRemoved.matches._TYPE) => {
  const state = getState(AdminAvatarState)
  return state.merge({ updateNeeded: true })
}

const avatarUpdatedReceptor = (action: typeof AdminAvatarActions.avatarUpdated.matches._TYPE) => {
  const state = getState(AdminAvatarState)
  return state.merge({ updateNeeded: true })
}

export const AdminAvatarReceptors = {
  avatarsFetchedReceptor,
  avatarCreatedReceptor,
  avatarRemovedReceptor,
  avatarUpdatedReceptor
}

export const accessAdminAvatarState = () => getState(AdminAvatarState)

export const useAdminAvatarState = () => useState(accessAdminAvatarState())

//Service
export const AdminAvatarService = {
  fetchAdminAvatars: async (skip = 0, search: string | null = null, sortField = 'name', orderBy = 'asc') => {
    let sortData = {}
    if (sortField.length > 0) {
      sortData[sortField] = orderBy === 'desc' ? 0 : 1
    }
    const adminAvatarState = accessAdminAvatarState()
    const limit = adminAvatarState.limit.value
    const avatars = (await API.instance.client.service('avatar').find({
      query: {
        $sort: {
          ...sortData
        },
        $limit: limit,
        $skip: skip * AVATAR_PAGE_LIMIT,
        search: search
      }
    })) as Paginated<AvatarInterface>
    dispatchAction(AdminAvatarActions.avatarsFetched({ avatars }))
  },
  removeAdminAvatar: async (id: string) => {
    try {
      await API.instance.client.service('avatar').remove(id)
      dispatchAction(AdminAvatarActions.avatarRemoved({}))
    } catch (err) {
      logger.error(err)
    }
  }
}

//Action
export class AdminAvatarActions {
  static avatarsFetched = defineAction({
    type: 'xre.client.AdminAvatar.AVATARS_RETRIEVED' as const,
    avatars: matches.object as Validator<unknown, AvatarResult>
  })

  static avatarCreated = defineAction({
    type: 'xre.client.AdminAvatar.AVATAR_CREATED' as const
  })

  static avatarRemoved = defineAction({
    type: 'xre.client.AdminAvatar.AVATAR_REMOVED' as const
  })

  static avatarUpdated = defineAction({
    type: 'xre.client.AdminAvatar.AVATAR_UPDATED' as const
  })
}
