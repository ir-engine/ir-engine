import { Paginated } from '@feathersjs/feathers'
import { useState } from '@speigg/hookstate'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import {
  addActionReceptor,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  registerState
} from '@xrengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
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

export const registerAdminInstanceServiceActions = () => {
  registerState(AdminInstanceState)

  // Register receptor
  addActionReceptor(function AdminInstanceServiceReceptor(action) {
    getState(AdminInstanceState).batch((s) => {
      matches(action)
        .when(AdminInstanceAction.instancesRetrievedAction.matches, (action) => {
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
        })
        .when(AdminInstanceAction.instancesRetrievedAction.matches, () => {
          return s.merge({ updateNeeded: true })
        })
    })
  })
}

// temporary
registerAdminInstanceServiceActions()

export const accessInstanceState = () => getState(AdminInstanceState)

export const useInstanceState = () => useState(accessInstanceState())

//Service
export const InstanceService = {
  fetchAdminInstances: async (value: string | null = null, skip = 0, sortField = 'createdAt', orderBy = 'asc') => {
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        let sortData = {}
        if (sortField.length > 0) {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }
        const instances = (await client.service('instance').find({
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
        dispatchAction(AdminInstanceAction.instancesRetrievedAction({ instanceResult: instances }))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeInstance: async (id: string) => {
    const result = (await client.service('instance').patch(id, { ended: true })) as Instance
    dispatchAction(AdminInstanceAction.instanceRemovedAction({ instance: result }))
  }
}

if (globalThis.process.env['VITE_OFFLINE_MODE'] !== 'true') {
  client.service('instance').on('removed', (params) => {
    dispatchAction(AdminInstanceAction.instanceRemovedAction({ instance: params.instance }))
  })
}
export class AdminInstanceAction {
  static instancesRetrievedAction = defineAction({
    store: 'ENGINE',
    type: 'admin.INSTANCES_RETRIEVED',
    instanceResult: matches.object as Validator<unknown, Paginated<Instance>>
  })
  static instanceRemovedAction = defineAction({
    store: 'ENGINE',
    type: 'admin.INSTANCE_REMOVED_ROW',
    instance: matches.object as Validator<unknown, Instance>
  })
}
