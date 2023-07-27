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
import { StaticResourceFilterResult } from '@etherealengine/common/src/interfaces/StaticResourceResult'
import { AdminAssetUploadArgumentsType } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { uploadToFeathersService } from '../../util/upload'

const logger = multiLogger.child({ component: 'client-core:ResourcesService' })

export const RESOURCE_PAGE_LIMIT = 100

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

export const ResourceService = {
  createOrUpdateResource: async (resource: AdminAssetUploadArgumentsType, resourceBlob: File) => {
    try {
      await uploadToFeathersService('upload-asset', [resourceBlob], {
        type: 'admin-file-upload',
        args: resource
      })

      await ResourceService.getResourceFilters()
      getMutableState(AdminResourceState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeResource: async (id: string) => {
    try {
      await Engine.instance.api.service('static-resource').remove(id)

      await ResourceService.getResourceFilters()
      getMutableState(AdminResourceState).merge({ updateNeeded: true })
    } catch (err) {
      logger.error(err)
    }
  },
  fetchAdminResources: async (skip = 0, search: string | null = null, sortField = 'key', orderBy = 'asc') => {
    const $sort = sortField.length ? { [sortField]: orderBy === 'desc' ? 0 : 1 } : {}
    const adminResourceState = getMutableState(AdminResourceState)
    const limit = adminResourceState.limit.value
    const selectedMimeTypes = adminResourceState.selectedMimeTypes.value

    const resources = await Engine.instance.api.service('static-resource').find({
      query: {
        $sort,
        $limit: limit,
        $skip: skip * RESOURCE_PAGE_LIMIT,
        search: search,
        mimeTypes: selectedMimeTypes
      }
    })

    getMutableState(AdminResourceState).merge({
      resources: resources.data,
      skip: resources.skip,
      limit: resources.limit,
      total: resources.total,
      retrieving: false,
      fetched: true,
      updateNeeded: false,
      lastFetched: Date.now()
    })
  },
  getResourceFilters: async () => {
    const filters = await Engine.instance.api.service('static-resource-filters').get()
    getMutableState(AdminResourceState).merge({
      filters: filters,
      selectedMimeTypes: filters.mimeTypes
    })
  },
  setSelectedMimeTypes: async (types: string[]) => {
    getMutableState(AdminResourceState).merge({
      updateNeeded: true,
      selectedMimeTypes: types
    })
  },
  resetFilter: () => {
    getMutableState(AdminResourceState).merge((prevState) => ({
      updateNeeded: true,
      selectedMimeTypes: prevState.filters?.mimeTypes
    }))
  }
}
