import Immutable from 'immutable'
import { InstanceRemovedResponse, InstancesRetrievedResponse } from './actions'

import { INSTANCE_REMOVED_ROW, INSTANCES_RETRIEVED } from '../../../../world/reducers/actions'
// } from "../../actions";
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
  instances: {
    instances: [],
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

const adminReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case INSTANCES_RETRIEVED:
      result = (action as InstancesRetrievedResponse).instances
      updateMap = new Map(state.get('instances'))
      updateMap.set('instances', (result as any).data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('instances', updateMap)

    case INSTANCE_REMOVED_ROW:
      result = (action as InstanceRemovedResponse).instance
      updateMap = new Map(state.get('instances'))
      let instances = updateMap.get('instances')
      instances = instances.filter((instance) => instance.id !== result.id)
      updateMap.set('instances', instances)
      return state.set('instances', updateMap)
  }

  return state
}

export default adminReducer
