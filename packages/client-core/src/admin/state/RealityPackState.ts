import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { RealityPackActionType } from './RealityPackActions'
import { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'

export const REALITY_PACK_PAGE_LIMIT = 100

export const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  realityPacks: {
    realityPacks: [] as Array<RealityPackInterface>,
    skip: 0,
    limit: REALITY_PACK_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  }
})

export const receptor = (action: RealityPackActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'REALITY_PACKS_RETRIEVED':
        result = action.realityPackResult
        return s.realityPacks.merge({
          realityPacks: result.data,
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

export const accessRealityPackState = () => state

export const useRealityPackState = () => useState(state) as any as typeof state
