import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@standardcreative/common/src/interfaces/User'
import { IdentityProviderSeed } from '@standardcreative/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@standardcreative/common/src/interfaces/AuthUser'
import { AvatarActionType } from './AvatarActions'
import { Avatar } from '@standardcreative/common/src/interfaces/Avatar'

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
    lastFetched: Date.now()
  }
})

export const receptor = (action: AvatarActionType): any => {
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
          lastFetched: Date.now()
        })
    }
  }, action.type)
}

export const accessAvatarState = () => state

export const useAvatarState = () => useState(state) as any as typeof state
