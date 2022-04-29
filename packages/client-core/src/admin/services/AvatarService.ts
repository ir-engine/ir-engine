import { createState, useState } from '@speigg/hookstate'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AvatarResult } from '@xrengine/common/src/interfaces/AvatarResult'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
export const AVATAR_PAGE_LIMIT = 100

const state = createState({
  avatars: [] as Array<AvatarInterface>,
  skip: 0,
  limit: AVATAR_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now()
})

store.receptors.push((action: AvatarActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'AVATARS_RETRIEVED':
        return s.merge({
          avatars: action.avatars.data,
          skip: action.avatars.skip,
          limit: action.avatars.limit,
          total: action.avatars.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'AVATAR_CREATED':
        return s.merge({ updateNeeded: true })
      case 'AVATAR_REMOVED':
        return s.merge({ updateNeeded: true })
      case 'AVATAR_UPDATED':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessAvatarState = () => state

export const useAvatarState = () => useState(state) as any as typeof state

//Service
export const AvatarService = {
  fetchAdminAvatars: async (skip = 0, search: string | null = null, sortField = 'name', orderBy = 'asc') => {
    const dispatch = useDispatch()
    let sortData = {}
    if (sortField.length > 0) {
      sortData[sortField] = orderBy === 'desc' ? 0 : 1
    }
    const adminAvatarState = accessAvatarState()
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
    dispatch(AvatarAction.avatarsFetched(avatars))
  },
  removeAdminAvatar: async (id: string, name: string) => {
    const dispatch = useDispatch()
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
      dispatch(AvatarAction.avatarRemoved())
    } catch (err) {
      console.error(err)
    }
  }
}

//Action
export const AvatarAction = {
  avatarsFetched: (avatars: AvatarResult) => {
    return {
      type: 'AVATARS_RETRIEVED' as const,
      avatars: avatars
    }
  },
  avatarCreated: () => {
    return {
      type: 'AVATAR_CREATED' as const
    }
  },
  avatarRemoved: () => {
    return {
      type: 'AVATAR_REMOVED' as const
    }
  },
  avatarUpdated: () => {
    return {
      type: 'AVATAR_UPDATED' as const
    }
  }
}

export type AvatarActionType = ReturnType<typeof AvatarAction[keyof typeof AvatarAction]>
