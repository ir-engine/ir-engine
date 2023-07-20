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

import { Location } from '@etherealengine/common/src/interfaces/Location'
import { LocationType } from '@etherealengine/common/src/interfaces/LocationType'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

const logger = multiLogger.child({ component: 'client-core:LocationService' })

export const LOCATION_PAGE_LIMIT = 100

export const AdminLocationState = defineState({
  name: 'AdminLocationState',
  initial: () => ({
    locations: [] as Array<Location>,
    skip: 0,
    limit: LOCATION_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    created: false,
    lastFetched: Date.now(),
    locationTypes: [] as Array<LocationType>
  })
})

export const AdminLocationService = {
  fetchLocationTypes: async () => {
    await Engine.instance.api.service('location-type').find()
    getMutableState(AdminLocationState).merge({ updateNeeded: true })
  },
  patchLocation: async (id: string, location: any) => {
    try {
      await Engine.instance.api.service('location').patch(id, location)
      getMutableState(AdminLocationState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeLocation: async (id: string) => {
    await Engine.instance.api.service('location').remove(id)
    getMutableState(AdminLocationState).merge({ updateNeeded: true })
  },
  createLocation: async (location: any) => {
    try {
      await Engine.instance.api.service('location').create(location)
      getMutableState(AdminLocationState).merge({ updateNeeded: true, created: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchAdminLocations: async (
    value: string | null = null,
    skip = getMutableState(AdminLocationState).skip.value,
    sortField = 'name',
    orderBy = 'asc'
  ) => {
    try {
      let sortData = {}
      if (sortField.length > 0) {
        if (sortField === 'tags') {
          sortData['isFeatured'] = orderBy === 'desc' ? 0 : 1
          sortData['isLobby'] = orderBy === 'desc' ? 0 : 1
        } else {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }
      }

      const locations = (await Engine.instance.api.service('location').find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * LOCATION_PAGE_LIMIT,
          $limit: LOCATION_PAGE_LIMIT,
          adminnedLocations: true,
          search: value
        }
      })) as Paginated<Location>

      locations.data.forEach((locationData) => {
        if (locationData.location_setting) locationData.locationSetting = locationData.location_setting
      })
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
      const locations = (await Engine.instance.api.service('location').find({
        query: {
          search: value,
          $sort: {
            name: orderBy === 'desc' ? 0 : 1
          },
          $skip: getMutableState(AdminLocationState).skip.value,
          $limit: getMutableState(AdminLocationState).limit.value,
          adminnedLocations: true
        }
      })) as Paginated<Location>
      locations.data.forEach((locationData) => {
        if (locationData.location_setting) locationData.locationSetting = locationData.location_setting
      })
    } catch (error) {
      logger.error(error)
    }
  }
}
