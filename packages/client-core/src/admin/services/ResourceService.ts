/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import {
  StaticResourceFilterResult,
  StaticResourceResult
} from '@etherealengine/common/src/interfaces/StaticResourceResult'
import { AdminAssetUploadArgumentsType } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { uploadToFeathersService } from '../../util/upload'

const logger = multiLogger.child({ component: 'client-core:ResourcesService' })

export const RESOURCE_PAGE_LIMIT = 100

//State
export const AdminResourceState = defineState({
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
    selectedMimeTypes: [] as string[]
  })
})

const resourceNeedsUpdateReceptor = (action: typeof AdminResourceActions.resourceNeedsUpdated.matches._TYPE) => {
  const state = getMutableState(AdminResourceState)
  return state.merge({ updateNeeded: true })
}

const resourcesFetchedReceptor = (action: typeof AdminResourceActions.resourcesFetched.matches._TYPE) => {
  const state = getMutableState(AdminResourceState)
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
  const state = getMutableState(AdminResourceState)
  return state.merge({
    filters: action.filters,
    selectedMimeTypes: action.filters.mimeTypes
  })
}

const setSelectedMimeTypesReceptor = (action: typeof AdminResourceActions.setSelectedMimeTypes.matches._TYPE) => {
  const state = getMutableState(AdminResourceState)
  return state.merge({
    updateNeeded: true,
    selectedMimeTypes: action.types
  })
}

const resourcesResetFilterReceptor = (action: typeof AdminResourceActions.resourcesResetFilter.matches._TYPE) => {
  const state = getMutableState(AdminResourceState)
  return state.merge({
    updateNeeded: true,
    selectedMimeTypes: state.filters.value?.mimeTypes
  })
}

export const AdminResourceReceptors = {
  resourcesFetchedReceptor,
  resourceFiltersFetchedReceptor,
  setSelectedMimeTypesReceptor,
  resourceNeedsUpdateReceptor,
  resourcesResetFilterReceptor
}

export const ResourceService = {
  createOrUpdateResource: async (resource: AdminAssetUploadArgumentsType, resourceBlob: File) => {
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
      await Engine.instance.api.service('static-resource').remove(id)

      await ResourceService.getResourceFilters()
      dispatchAction(AdminResourceActions.resourceNeedsUpdated({}))
    } catch (err) {
      logger.error(err)
    }
  },
  fetchAdminResources: async (skip = 0, search: string | null = null, sortField = 'key', orderBy = 'asc') => {
    const sortData = {}
    if (sortField.length > 0) {
      sortData[sortField] = orderBy === 'desc' ? 0 : 1
    }
    const adminResourceState = getMutableState(AdminResourceState)
    const limit = adminResourceState.limit.value
    const selectedMimeTypes = adminResourceState.selectedMimeTypes.value

    const resources = await Engine.instance.api.service('static-resource').find({
      query: {
        $sort: {
          ...sortData
        },
        $limit: limit,
        $skip: skip * RESOURCE_PAGE_LIMIT,
        search: search,
        mimeTypes: selectedMimeTypes
      }
    })
    dispatchAction(AdminResourceActions.resourcesFetched({ resources }))
  },
  getResourceFilters: async () => {
    const filters = (await Engine.instance.api.service('static-resource-filters').get()) as StaticResourceFilterResult
    dispatchAction(AdminResourceActions.resourceFiltersFetched({ filters }))
  },
  setSelectedMimeTypes: async (types: string[]) => {
    dispatchAction(AdminResourceActions.setSelectedMimeTypes({ types }))
  },
  resetFilter: () => {
    dispatchAction(AdminResourceActions.resourcesResetFilter({}))
  }
}

//Action
export class AdminResourceActions {
  static resourceNeedsUpdated = defineAction({
    type: 'ee.client.AdminResource.RESOURCE_NEEDS_UPDATE' as const
  })

  static resourcesFetched = defineAction({
    type: 'ee.client.AdminResource.RESOURCES_RETRIEVED' as const,
    resources: matches.object as Validator<unknown, StaticResourceResult>
  })

  static resourceFiltersFetched = defineAction({
    type: 'ee.client.AdminResource.RESOURCE_FILTERS_RETRIEVED' as const,
    filters: matches.object as Validator<unknown, StaticResourceFilterResult>
  })

  static setSelectedMimeTypes = defineAction({
    type: 'ee.client.AdminResource.RESOURCE_SET_MIME' as const,
    types: matches.object as Validator<unknown, string[]>
  })

  static resourcesResetFilter = defineAction({
    type: 'ee.client.AdminResource.RESOURCES_RESET_FILTER' as const
  })
}
