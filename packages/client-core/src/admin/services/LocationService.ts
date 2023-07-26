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

import { Paginated } from '@feathersjs/feathers'

import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { locationTypePath, LocationTypeType } from '@etherealengine/engine/src/schemas/social/location-type.schema'
import {
  LocationData,
  LocationPatch,
  locationPath,
  LocationType
} from '@etherealengine/engine/src/schemas/social/location.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

const logger = multiLogger.child({ component: 'client-core:LocationService' })

export const LOCATION_PAGE_LIMIT = 100

export const AdminLocationState = defineState({
  name: 'AdminLocationState',
  initial: () => ({
    locations: [] as Array<LocationType>,
    skip: 0,
    limit: LOCATION_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    created: false,
    lastFetched: Date.now(),
    locationTypes: [] as Array<LocationTypeType>
  })
})

export const AdminLocationService = {
  fetchLocationTypes: async () => {
    const locationType = await Engine.instance.api.service(locationTypePath).find()
    getMutableState(AdminLocationState).merge({ locationTypes: locationType.data })
  },
  patchLocation: async (id: string, location: LocationPatch) => {
    try {
      await Engine.instance.api.service(locationPath).patch(id, location)
      getMutableState(AdminLocationState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeLocation: async (id: string) => {
    await Engine.instance.api.service(locationPath).remove(id)
    getMutableState(AdminLocationState).merge({ updateNeeded: true })
  },
  createLocation: async (location: LocationData) => {
    try {
      await Engine.instance.api.service(locationPath).create(location)
      getMutableState(AdminLocationState).merge({ updateNeeded: true, created: true })
    } catch (err) {
      logger.error(err)
      if (err.code && err.sqlMessage) {
        NotificationService.dispatchNotify(`${err.code}: ${err.sqlMessage}`, { variant: 'error' })
      } else {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      }
    }
  },
  fetchAdminLocations: async (
    value = '',
    skip = getMutableState(AdminLocationState).skip.value,
    sortField = 'name',
    orderBy = 'asc'
  ) => {
    try {
      const sortData = {}
      if (sortField.length > 0) {
        if (sortField === 'tags') {
          sortData['isFeatured'] = orderBy === 'desc' ? -1 : 1
          sortData['isLobby'] = orderBy === 'desc' ? -1 : 1
        } else {
          sortData[sortField] = orderBy === 'desc' ? -1 : 1
        }
      }

      const locations = (await Engine.instance.api.service(locationPath).find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * LOCATION_PAGE_LIMIT,
          $limit: LOCATION_PAGE_LIMIT,
          adminnedLocations: true,
          search: value
        }
      })) as Paginated<LocationType>

      getMutableState(AdminLocationState).merge({
        locations: locations.data,
        skip: locations.skip,
        limit: locations.limit,
        total: locations.total,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    } catch (error) {
      logger.error(error)
    }
  },
  searchAdminLocations: async (value, orderBy = 'asc') => {
    try {
      const locations = (await Engine.instance.api.service(locationPath).find({
        query: {
          search: value,
          $sort: {
            name: orderBy === 'desc' ? -1 : 1
          },
          $skip: getMutableState(AdminLocationState).skip.value,
          $limit: getMutableState(AdminLocationState).limit.value,
          adminnedLocations: true
        }
      })) as Paginated<LocationType>
    } catch (error) {
      logger.error(error)
    }
  }
}
