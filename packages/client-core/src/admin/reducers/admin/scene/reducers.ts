import Immutable from 'immutable'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { ADMIN_SCENES_RETRIEVED } from '../../actions'
import { CollectionsFetchedAction } from './actions'

export const SCENE_PAGE_LIMIT = 100

export const initialSceneAdminState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  scenes: {
    scenes: [],
    skip: 0,
    limit: SCENE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialSceneAdminState) as any

const adminReducer = (state = immutableState, action: any): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case ADMIN_SCENES_RETRIEVED:
      result = (action as CollectionsFetchedAction).collections
      updateMap = new Map(state.get('scenes'))
      updateMap.set('scenes', (result as any).data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('scenes', updateMap)
  }

  return state
}

export default adminReducer
