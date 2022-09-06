import { Paginated } from '@feathersjs/feathers/lib'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import { StaticResourceResult } from '@xrengine/common/src/interfaces/StaticResourceResult'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:ResourcesService' })

export const RESOURCE_PAGE_LIMIT = 100

//State
const AdminResourceState = defineState({
  name: 'AdminResourceState',
  initial: () => ({
    resources: [] as Array<StaticResourceInterface>,
    skip: 0,
    limit: RESOURCE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const resourcesFetchedReceptor = (action: typeof AdminResourceActions.resourcesFetched.matches._TYPE) => {
  const state = getState(AdminResourceState)
  return state.merge({
    resources: action.resources.data,
    skip: action.resources.skip,
    limit: action.resources.limit,
    total: action.resources.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const resourceRemovedReceptor = (action: typeof AdminResourceActions.resourceRemoved.matches._TYPE) => {
  const state = getState(AdminResourceState)
  return state.merge({ updateNeeded: true })
}

export const AdminResourceReceptors = {
  resourcesFetchedReceptor,
  resourceRemovedReceptor
}

export const accessAdminResourceState = () => getState(AdminResourceState)

export const useAdminResourceState = () => useState(accessAdminResourceState())

export const ResourceService = {
  fetchAdminResources: async (skip = 0, search: string | null = null, sortField = 'key', orderBy = 'asc') => {
    let sortData = {}
    if (sortField.length > 0) {
      sortData[sortField] = orderBy === 'desc' ? 0 : 1
    }
    const adminResourceState = accessAdminResourceState()
    const limit = adminResourceState.limit.value
    const resources = (await API.instance.client.service('static-resource').find({
      query: {
        $sort: {
          ...sortData
        },
        $limit: limit,
        $skip: skip * RESOURCE_PAGE_LIMIT
        // search: search
      }
    })) as Paginated<StaticResourceInterface>
    dispatchAction(AdminResourceActions.resourcesFetched({ resources }))
  },
  removeAdminResource: async (id: string) => {
    try {
      await API.instance.client.service('static-resource').remove(id)
      dispatchAction(AdminResourceActions.resourceRemoved({ id }))
    } catch (err) {
      logger.error(err)
    }
  }
}

//Action
export class AdminResourceActions {
  static resourcesFetched = defineAction({
    type: 'RESOURCES_RETRIEVED' as const,
    resources: matches.object as Validator<unknown, StaticResourceResult>
  })

  static resourceRemoved = defineAction({
    type: 'RESOURCE_REMOVED' as const,
    id: matches.string
  })
}
