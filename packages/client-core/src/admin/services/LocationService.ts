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
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { locationTypePath, LocationTypeType } from '@etherealengine/engine/src/schemas/social/location-type.schema'
import {
  LocationData,
  LocationPatch,
  locationPath,
  LocationType
} from '@etherealengine/engine/src/schemas/social/location.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

const logger = multiLogger.child({ component: 'client-core:LocationService' })

//State
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

export const locationsRetrievedReceptor = (action: typeof AdminLocationActions.locationsRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminLocationState)
  return state.merge({
    locations: action.locations.data,
    skip: action.locations.skip,
    limit: action.locations.limit,
    total: action.locations.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

export const locationCreatedReceptor = (action: typeof AdminLocationActions.locationCreated.matches._TYPE) => {
  const state = getMutableState(AdminLocationState)
  return state.merge({ updateNeeded: true, created: true })
}

export const locationPatchedReceptor = (action: typeof AdminLocationActions.locationPatched.matches._TYPE) => {
  const state = getMutableState(AdminLocationState)
  return state.merge({ updateNeeded: true })
}

export const locationRemovedReceptor = (action: typeof AdminLocationActions.locationRemoved.matches._TYPE) => {
  const state = getMutableState(AdminLocationState)
  return state.merge({ updateNeeded: true })
}

export const locationTypesRetrievedReceptor = (
  action: typeof AdminLocationActions.locationTypesRetrieved.matches._TYPE
) => {
  const state = getMutableState(AdminLocationState)
  return state.merge({ locationTypes: action.locationTypes.data, updateNeeded: false })
}

export const AdminLocationReceptors = {
  locationsRetrievedReceptor,
  locationCreatedReceptor,
  locationPatchedReceptor,
  locationRemovedReceptor,
  locationTypesRetrievedReceptor
}

//Service
export const AdminLocationService = {
  fetchLocationTypes: async () => {
    const locationTypes = await API.instance.client.service(locationTypePath).find()
    dispatchAction(AdminLocationActions.locationTypesRetrieved({ locationTypes }))
  },
  patchLocation: async (id: string, location: LocationPatch) => {
    try {
      const result = await API.instance.client.service(locationPath).patch(id, location)
      dispatchAction(AdminLocationActions.locationPatched({ location: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeLocation: async (id: string) => {
    const result = await API.instance.client.service(locationPath).remove(id)
    dispatchAction(AdminLocationActions.locationRemoved({ location: result }))
  },
  createLocation: async (location: LocationData) => {
    try {
      const result = await API.instance.client.service(locationPath).create(location)
      dispatchAction(AdminLocationActions.locationCreated({ location: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
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

      const locations = (await API.instance.client.service(locationPath).find({
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

      dispatchAction(AdminLocationActions.locationsRetrieved({ locations }))
    } catch (error) {
      logger.error(error)
    }
  },
  searchAdminLocations: async (value, orderBy = 'asc') => {
    try {
      const locations = (await API.instance.client.service(locationPath).find({
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

//Action
export class AdminLocationActions {
  static locationsRetrieved = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATIONS_RETRIEVED' as const,
    locations: matches.object as Validator<unknown, Paginated<LocationType>>
  })

  // static locationRetrieved = defineAction({
  //   type: 'ee.client.AdminLocation.ADMIN_LOCATION_RETRIEVED' as const,
  //   location: matches.object as Validator<unknown, LocationType>
  // })

  static locationCreated = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATION_CREATED' as const,
    location: matches.object as Validator<unknown, LocationType>
  })

  static locationPatched = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATION_PATCHED' as const,
    location: matches.object as Validator<unknown, LocationType>
  })

  static locationRemoved = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATION_REMOVED' as const,
    location: matches.object as Validator<unknown, LocationType>
  })

  // static locationBanCreated = defineAction({
  //   type: 'ee.client.AdminLocation.ADMIN_LOCATION_BAN_CREATED' as const
  // })

  // static fetchingCurrentLocation = defineAction({
  //   type: 'ee.client.AdminLocation.ADMIN_FETCH_CURRENT_LOCATION' as const
  // })

  // static locationNotFound = defineAction({
  //   type: 'ee.client.AdminLocation.ADMIN_LOCATION_NOT_FOUND' as const
  // })

  static locationTypesRetrieved = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATION_TYPES_RETRIEVED' as const,
    locationTypes: matches.object as Validator<unknown, Paginated<LocationTypeType>>
  })
}
