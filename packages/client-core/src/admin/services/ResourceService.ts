import { Paginated } from '@feathersjs/feathers/lib'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import { StaticResourceFilterResult, StaticResourceResult } from '@xrengine/common/src/interfaces/StaticResourceResult'
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
    lastFetched: Date.now(),
    filters: undefined as StaticResourceFilterResult | undefined,
    selectedMimeTypes: [] as string[],
    selectedResourceTypes: [] as string[]
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

const resourceFiltersFetchedReceptor = (action: typeof AdminResourceActions.resourceFiltersFetched.matches._TYPE) => {
  const state = getState(AdminResourceState)
  return state.merge({
    filters: action.filters,
    selectedMimeTypes: action.filters.mimeTypes,
    selectedResourceTypes: action.filters.staticResourceTypes
  })
}

const setSelectedMimeTypesReceptor = (action: typeof AdminResourceActions.setSelectedMimeTypes.matches._TYPE) => {
  const state = getState(AdminResourceState)
  return state.merge({
    updateNeeded: true,
    selectedMimeTypes: action.types
  })
}

const setSelectedResourceTypesReceptor = (
  action: typeof AdminResourceActions.setSelectedResourceTypes.matches._TYPE
) => {
  const state = getState(AdminResourceState)
  return state.merge({
    updateNeeded: true,
    selectedResourceTypes: action.types
  })
}

const resourceRemovedReceptor = (action: typeof AdminResourceActions.resourceRemoved.matches._TYPE) => {
  const state = getState(AdminResourceState)
  return state.merge({ updateNeeded: true })
}

const resourcesResetFilterReceptor = (action: typeof AdminResourceActions.resourcesResetFilter.matches._TYPE) => {
  const state = getState(AdminResourceState)
  return state.merge({
    updateNeeded: true,
    selectedMimeTypes: state.filters.value?.mimeTypes,
    selectedResourceTypes: state.filters.value?.staticResourceTypes
  })
}

export const AdminResourceReceptors = {
  resourcesFetchedReceptor,
  resourceFiltersFetchedReceptor,
  setSelectedMimeTypesReceptor,
  setSelectedResourceTypesReceptor,
  resourceRemovedReceptor,
  resourcesResetFilterReceptor
}

export const accessAdminResourceState = () => getState(AdminResourceState)

export const useAdminResourceState = () => useState(accessAdminResourceState())

export const ResourceService = {
  getResourceFilters: async () => {
    const filters = (await API.instance.client.service('static-resource-filters').get()) as StaticResourceFilterResult
    dispatchAction(AdminResourceActions.resourceFiltersFetched({ filters }))
  },
  fetchAdminResources: async (skip = 0, search: string | null = null, sortField = 'key', orderBy = 'asc') => {
    let sortData = {}
    if (sortField.length > 0) {
      sortData[sortField] = orderBy === 'desc' ? 0 : 1
    }
    const adminResourceState = accessAdminResourceState()
    const limit = adminResourceState.limit.value
    const selectedMimeTypes = adminResourceState.selectedMimeTypes.value
    const selectedResourceTypes = adminResourceState.selectedResourceTypes.value

    const resources = (await API.instance.client.service('static-resource').find({
      query: {
        $sort: {
          ...sortData
        },
        $limit: limit,
        $skip: skip * RESOURCE_PAGE_LIMIT,
        search: search,
        mimeTypes: selectedMimeTypes,
        resourceTypes: selectedResourceTypes
      }
    })) as Paginated<StaticResourceInterface>
    dispatchAction(AdminResourceActions.resourcesFetched({ resources }))
  },
  setSelectedMimeTypes: async (types: string[]) => {
    dispatchAction(AdminResourceActions.setSelectedMimeTypes({ types }))
  },
  setSelectedResourceTypes: async (types: string[]) => {
    dispatchAction(AdminResourceActions.setSelectedResourceTypes({ types }))
  },
  removeAdminResource: async (id: string) => {
    try {
      await API.instance.client.service('static-resource').remove(id)
      dispatchAction(AdminResourceActions.resourceRemoved({ id }))
    } catch (err) {
      logger.error(err)
    }
  },
  resetFilter: () => {
    dispatchAction(AdminResourceActions.resourcesResetFilter({}))
  }
}

//Action
export class AdminResourceActions {
  static resourcesFetched = defineAction({
    type: 'RESOURCES_RETRIEVED' as const,
    resources: matches.object as Validator<unknown, StaticResourceResult>
  })

  static resourceFiltersFetched = defineAction({
    type: 'RESOURCE_FILTERS_RETRIEVED' as const,
    filters: matches.object as Validator<unknown, StaticResourceFilterResult>
  })

  static resourceRemoved = defineAction({
    type: 'RESOURCE_REMOVED' as const,
    id: matches.string
  })

  static setSelectedMimeTypes = defineAction({
    type: 'RESOURCE_SET_MIME' as const,
    types: matches.object as Validator<unknown, string[]>
  })

  static setSelectedResourceTypes = defineAction({
    type: 'RESOURCE_SET_TYPE' as const,
    types: matches.object as Validator<unknown, string[]>
  })

  static resourcesResetFilter = defineAction({
    type: 'RESOURCES_RESET_FILTER' as const
  })
}
