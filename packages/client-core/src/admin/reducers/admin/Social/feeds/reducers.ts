import Immutable from 'immutable'
import { FeedsRetrievedAction } from './actions'
import { FEEDS_ADMIN_RETRIEVED, ADMIN_FEEDS_FETCH, ADD_AS_ADMIN_FEED, REMOVE_FEED } from '../../../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

export const PAGE_LIMIT = 100

export const initialAdminState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  feeds: {
    feeds: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialAdminState)

const feedsReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case FEEDS_ADMIN_RETRIEVED:
      result = (action as FeedsRetrievedAction).feeds
      updateMap = new Map(state.get('feeds'))
      updateMap.set('feeds', result.data)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('feeds', updateMap)

    case ADD_AS_ADMIN_FEED:
      updateMap = new Map(state.get('feeds'))
      updateMap.set('updateNeeded', true)
      return state.set('feeds', updateMap)

    case REMOVE_FEED:
      const feedData = new Map(state.get('feeds'))
      feedData.set('updateNeeded', true)
      return state.set('feeds', feedData)
  }

  return state
}

export default feedsReducer
