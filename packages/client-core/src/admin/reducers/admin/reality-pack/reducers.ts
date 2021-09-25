import Immutable from 'immutable'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { RealityPacksFetchedAction, REALITY_PACKS_RETRIEVED } from './actions'

export const REALITY_PACK_PAGE_LIMIT = 100

export const initialAvatarAdminState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  realityPacks: {
    realityPacks: [],
    skip: 0,
    limit: REALITY_PACK_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialAvatarAdminState) as any

const adminReducer = (state = immutableState, action: any): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case REALITY_PACKS_RETRIEVED:
      result = (action as RealityPacksFetchedAction).realityPacks
      updateMap = new Map(state.get('realityPacks'))
      updateMap.set('realityPacks', (result as any).data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('realityPacks', updateMap)
  }

  return state
}

export default adminReducer
