import Immutable from 'immutable'
import { RETRIEVE_CREATOR_AS_ADMIN, CREATE_CREATOR_AS_ADMIN } from '../../../actions'
import { CreatorAction } from './actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

export const PAGE_LIMIT = 100

export const initialCreatorState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  creator: {
    creator: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialCreatorState)

const creatorReducer = (state = immutableState, action: CreatorAction) => {
  let result, updateMap

  switch (action.type) {
    case RETRIEVE_CREATOR_AS_ADMIN:
      result = (action as CreatorAction).creator
      updateMap = new Map(state.get('creator'))
      updateMap.set('creator', result)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('creator', updateMap)
  }
  return state
}

export default creatorReducer
