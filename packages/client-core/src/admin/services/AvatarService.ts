import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AvatarResult } from '@xrengine/common/src/interfaces/AvatarResult'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { client } from '../../feathers'

//State
export const AVATAR_PAGE_LIMIT = 100

const AdminAvatarState = defineState({
  name: 'AdminAvatarState',
  initial: () => ({
    avatars: [] as Array<AvatarInterface>,
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
    const avatars = await client.service('static-resource').find({
      query: {
        $sort: {
          ...sortData
        },
        $select: ['id', 'sid', 'key', 'name', 'url', 'staticResourceType', 'userId'],
        staticResourceType: 'avatar',
        userId: null,
        $limit: limit,
        $skip: skip * AVATAR_PAGE_LIMIT,
        getAvatarThumbnails: true,
        search: search
      }
    })
    dispatchAction(AdminAvatarActions.avatarsFetched({ avatars }))
  },
  removeAdminAvatar: async (id: string, name: string) => {
    try {
      await client.service('static-resource').remove(id)
      const avatarThumbnail = await client.service('static-resource').find({
        query: {
          name: name,
          staticResourceType: 'user-thumbnail',
          $limit: 1
        }
      })
      avatarThumbnail?.data?.length > 0 &&
        (await client.service('static-resource').remove(avatarThumbnail?.data[0]?.id))
      dispatchAction(AdminAvatarActions.avatarRemoved())
    } catch (err) {
      console.error(err)
    }
  }
}

//Action
export class AdminAvatarActions {
  static avatarsFetched = defineAction({
    type: 'AVATARS_RETRIEVED' as const,
    avatars: matches.object as Validator<unknown, AvatarResult>
  })

  static avatarCreated = defineAction({
    type: 'AVATAR_CREATED' as const
  })

  static avatarRemoved = defineAction({
    type: 'AVATAR_REMOVED' as const
  })

  static avatarUpdated = defineAction({
    type: 'AVATAR_UPDATED' as const
  })
}
