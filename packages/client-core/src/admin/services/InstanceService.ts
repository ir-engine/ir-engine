import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { Config } from '@xrengine/common/src/config'
import { accessAuthState } from '../../user/services/AuthService'

import { createState, useState } from '@hookstate/core'
import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { InstanceResult } from '@xrengine/common/src/interfaces/InstanceResult'

//State

export const INSTNCE_PAGE_LIMIT = 100

const state = createState({
  instances: [] as Array<Instance>,
  skip: 0,
  limit: INSTNCE_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now()
})

store.receptors.push((action: InstanceActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'INSTANCES_RETRIEVED':
        return s.merge({
          instances: action.instanceResult.data,
          skip: action.instanceResult.skip,
          limit: action.instanceResult.limit,
          total: action.instanceResult.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'INSTANCE_REMOVED_ROW':
        let instance = state.instances.value
        let instanceList = instance
        instanceList = instanceList.filter((instance) => instance.id !== action.instance.id)
        instance = instanceList
        s.merge({ instances: instance })
    }
  }, action.type)
})

export const accessInstanceState = () => state

export const useInstanceState = () => useState(state) as any as typeof state

//Service
export const InstanceService = {
  fetchAdminInstances: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const skip = accessInstanceState().skip.value
      const limit = accessInstanceState().limit.value
      const user = accessAuthState().user
      try {
        if (user.userRole.value === 'admin') {
          const instances = await client.service('instance').find({
            query: {
              $sort: {
                createdAt: -1
              },
              $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
              $limit: limit,
              action: 'admin'
            }
          })
          dispatch(InstanceAction.instancesRetrievedAction(instances))
        }
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeInstance: async (id: string) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('instance').patch(id, {
        ended: true
      })
      dispatch(InstanceAction.instanceRemovedAction(result))
    }
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance').on('removed', (params) => {
    store.dispatch(InstanceAction.instanceRemovedAction(params.instance))
  })
}

//Action
export const InstanceAction = {
  instancesRetrievedAction: (instanceResult: InstanceResult) => {
    return {
      type: 'INSTANCES_RETRIEVED' as const,
      instanceResult: instanceResult
    }
  },
  instanceRemovedAction: (instance: Instance) => {
    return {
      type: 'INSTANCE_REMOVED_ROW' as const,
      instance: instance
    }
  }
}

export type InstanceActionType = ReturnType<typeof InstanceAction[keyof typeof InstanceAction]>
