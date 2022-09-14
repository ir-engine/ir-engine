import { Paginated } from '@feathersjs/feathers'
import { useState } from '@hookstate/core'
import { useEffect } from 'react'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'

export const INSTANCE_PAGE_LIMIT = 100

export const AdminInstanceState = defineState({
  name: 'AdminInstanceState',
  initial: () => ({
    instances: [] as Array<Instance>,
    skip: 0,
    limit: INSTANCE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const instancesRetrievedReceptor = (action: typeof AdminInstanceActions.instancesRetrieved.matches._TYPE) => {
  const state = getState(AdminInstanceState)
  return state.merge({
    instances: action.instanceResult.data,
    skip: action.instanceResult.skip,
    limit: action.instanceResult.limit,
    total: action.instanceResult.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const instanceRemovedReceptor = (action: typeof AdminInstanceActions.instanceRemoved.matches._TYPE) => {
  const state = getState(AdminInstanceState)
  return state.merge({ updateNeeded: true })
}

export const AdminInstanceReceptors = {
  instancesRetrievedReceptor,
  instanceRemovedReceptor
}

export const accessAdminInstanceState = () => getState(AdminInstanceState)

export const useAdminInstanceState = () => useState(accessAdminInstanceState())

//Service
export const AdminInstanceService = {
  fetchAdminInstances: async (value: string | null = null, skip = 0, sortField = 'createdAt', orderBy = 'asc') => {
    const user = accessAuthState().user
    try {
      if (user.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
        let sortData = {}
        if (sortField.length > 0) {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }
        const instances = (await API.instance.client.service('instance').find({
          query: {
            $sort: {
              ...sortData
            },
            $skip: skip * INSTANCE_PAGE_LIMIT,
            $limit: INSTANCE_PAGE_LIMIT,
            action: 'admin',
            search: value
          }
        })) as Paginated<Instance>
        dispatchAction(AdminInstanceActions.instancesRetrieved({ instanceResult: instances }))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeInstance: async (id: string) => {
    const result = (await API.instance.client.service('instance').patch(id, { ended: true })) as Instance
    dispatchAction(AdminInstanceActions.instanceRemoved({ instance: result }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        dispatchAction(AdminInstanceActions.instanceRemoved({ instance: params.instance }))
      }
      API.instance.client.service('instance').on('removed', listener)
      return () => {
        API.instance.client.service('instance').off('removed', listener)
      }
    }, [])
  }
}

export class AdminInstanceActions {
  static instancesRetrieved = defineAction({
    type: 'xre.client.AdminInstance.INSTANCES_RETRIEVED',
    instanceResult: matches.object as Validator<unknown, Paginated<Instance>>
  })

  static instanceRemoved = defineAction({
    type: 'xre.client.AdminInstance.INSTANCE_REMOVED_ROW',
    instance: matches.object as Validator<unknown, Instance>
  })
}
