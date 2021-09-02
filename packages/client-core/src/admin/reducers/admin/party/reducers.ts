import Immutable from 'immutable'
import { partyAdminCreatedResponse } from './actions'

import { PARTY_ADMIN_CREATED, PARTY_ADMIN_DISPLAYED } from '../../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

export const PARTY_PAGE_LIMIT = 100

export const initialPartyAdminState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  parties: {
    parties: [],
    skip: 0,
    limit: PARTY_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialPartyAdminState) as any

const adminReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case PARTY_ADMIN_DISPLAYED:
      result = (action as partyAdminCreatedResponse).data
      updateMap = new Map(state.get('parties'))
      updateMap.set('parties', result)
      updateMap.set('updateNeeded', false)
      return state.set('parties', updateMap)

    case PARTY_ADMIN_CREATED:
      updateMap = new Map(state.get('parties'))
      updateMap.set('updateNeeded', true)
      return state.set('parties', updateMap)
  }

  return state
}

export default adminReducer
