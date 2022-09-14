import { Paginated } from '@feathersjs/feathers/lib'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import { StaticResourceFilterResult, StaticResourceResult } from '@xrengine/common/src/interfaces/StaticResourceResult'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { uploadToFeathersService } from '../../util/upload'

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

const resourceNeedsUpdateReceptor = (action: typeof AdminResourceActions.resourceNeedsUpdated.matches._TYPE) => {
  const state = getState(AdminResourceState)
  return state.merge({ updateNeeded: true })
}

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
  resourceNeedsUpdateReceptor,
  resourcesResetFilterReceptor
}

export const accessAdminResourceState = () => getState(AdminResourceState)

export const useAdminResourceState = () => useState(accessAdminResourceState())

export const ResourceService = {
  createOrUpdateResource: async (resource: any, resourceBlob: Blob) => {
    try {
      await uploadToFeathersService('upload-asset', [resourceBlob], {
        type: 'admin-file-upload',
        args: resource
      })

      await ResourceService.getResourceFilters()
      dispatchAction(AdminResourceActions.resourceNeedsUpdated({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeResource: async (id: string) => {
    try {
      await API.instance.client.service('static-resource').remove(id)

      await ResourceService.getResourceFilters()
      dispatchAction(AdminResourceActions.resourceNeedsUpdated({}))
    } catch (err) {
      logger.error(err)
    }
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
  getResourceFilters: async () => {
    const filters = (await API.instance.client.service('static-resource-filters').get()) as StaticResourceFilterResult
    dispatchAction(AdminResourceActions.resourceFiltersFetched({ filters }))
  },
  setSelectedMimeTypes: async (types: string[]) => {
    dispatchAction(AdminResourceActions.setSelectedMimeTypes({ types }))
  },
  setSelectedResourceTypes: async (types: string[]) => {
    dispatchAction(AdminResourceActions.setSelectedResourceTypes({ types }))
  },
  resetFilter: () => {
    dispatchAction(AdminResourceActions.resourcesResetFilter({}))
  }
}

//Action
export class AdminResourceActions {
  static resourceNeedsUpdated = defineAction({
    type: 'xre.client.AdminResource.RESOURCE_NEEDS_UPDATE' as const
  })

  static resourcesFetched = defineAction({
    type: 'xre.client.AdminResource.RESOURCES_RETRIEVED' as const,
    resources: matches.object as Validator<unknown, StaticResourceResult>
  })

  static resourceFiltersFetched = defineAction({
    type: 'xre.client.AdminResource.RESOURCE_FILTERS_RETRIEVED' as const,
    filters: matches.object as Validator<unknown, StaticResourceFilterResult>
  })

  static setSelectedMimeTypes = defineAction({
    type: 'xre.client.AdminResource.RESOURCE_SET_MIME' as const,
    types: matches.object as Validator<unknown, string[]>
  })

  static setSelectedResourceTypes = defineAction({
    type: 'xre.client.AdminResource.RESOURCE_SET_TYPE' as const,
    types: matches.object as Validator<unknown, string[]>
  })

  static resourcesResetFilter = defineAction({
    type: 'xre.client.AdminResource.RESOURCES_RESET_FILTER' as const
  })
}
