import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'

import { AvatarResult } from '@xrengine/common/src/interfaces/AvatarResult'

//State
export const AVATAR_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  avatars: {
    avatars: [] as Array<AvatarInterface>,
    skip: 0,
    limit: AVATAR_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  }
})

store.receptors.push((action: AvatarActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'AVATARS_RETRIEVED':
        result = action.avatars

        s.merge({
          avatars: {
            avatars: result.data,
            skip: result.skip,
            limit: result.limit,
            total: result.total,
            retrieving: false,
            fetched: true,
            updateNeeded: false,
            lastFetched: Date.now()
          }
        })
    }
  }, action.type)
})

export const accessAvatarState = () => state

export const useAvatarState = () => useState(state) as any as typeof state

//Service
export const AvatarService = {
  fetchAdminAvatars: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const adminAvatarState = accessAvatarState().avatars
      const limit = adminAvatarState.limit.value
      const skip = adminAvatarState.skip.value
      const avatars = await client.service('static-resource').find({
        query: {
          $select: ['id', 'sid', 'key', 'name', 'url', 'staticResourceType', 'userId'],
          staticResourceType: 'avatar',
          userId: null,
          $limit: limit,
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          getAvatarThumbnails: true
        }
      })
      dispatch(AvatarAction.avatarsFetched(avatars))
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
  }
}
export type AvatarActionType = ReturnType<typeof AvatarAction[keyof typeof AvatarAction]>
