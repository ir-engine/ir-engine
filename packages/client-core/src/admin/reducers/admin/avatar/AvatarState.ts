import { createState, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { AvatarActionType } from './AvatarActions'
import { Avatar } from '@xrengine/common/src/interfaces/Avatar'

export const AVATAR_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  avatars: {
    avatars: [] as Array<Avatar>,
    skip: 0,
    limit: AVATAR_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
})

export const adminAvatarReducer = (_, action: AvatarActionType) => {
  Promise.resolve().then(() => avatarReceptor(action))
  return state.attach(Downgraded).value
}

const avatarReceptor = (action: AvatarActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'AVATARS_RETRIEVED':
        result = action.avatars

        s.avatars.merge({
          avatars: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: new Date()
        })
    }
  }, action.type)
}

export const accessAvatarState = () => state
export const useAvatarState = () => useState(state) as any as typeof state
