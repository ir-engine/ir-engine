import { createState, useState, none, Downgraded } from '@hookstate/core'
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
    lastFetched: new Date()
  }
})

export const adminRealityPackReducer = (_, action: RealityPackActionType) => {
  Promise.resolve().then(() => realityPackReceptor(action))
  return state.attach(Downgraded).value
}

const realityPackReceptor = (action: RealityPackActionType): any => {
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
          lastFetched: new Date()
        })
    }
  }, action.type)
}

export const accessRealityPackState = () => state
export const useRealityPackState = () => useState(state) as any as typeof state
