import { createState, useState, none, Downgraded } from '@hookstate/core'
import { InstanceActionType } from './InstanceActions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { Instance } from '@xrengine/common/src/interfaces/Instance'

export const INSTNCE_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  instances: {
    instances: [] as Array<Instance>,
    skip: 0,
    limit: INSTNCE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
})

export const adminInstanceReducer = (_, action: InstanceActionType) => {
  Promise.resolve().then(() => instanceReceptor(action))
  return state.attach(Downgraded).value
}

const instanceReceptor = (action: InstanceActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'INSTANCES_RETRIEVED':
        result = action.instanceResult
        return s.instances.merge({
          instances: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: new Date()
        })
      case 'INSTANCE_REMOVED_ROW':
        result = action.instance
        let instance = state.instances.value
        let instanceList = instance.instances
        instanceList = instanceList.filter((instance) => instance.id !== result.id)
        instance.instances = instanceList
        s.merge({ instances: instance })
    }
  }, action.type)
}

export const accessInstanceState = () => state
export const useInstanceState = () => useState(state) as any as typeof state
