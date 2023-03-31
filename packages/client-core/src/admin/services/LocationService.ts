import { Paginated } from '@feathersjs/feathers'

import { Location } from '@etherealengine/common/src/interfaces/Location'
import { LocationType } from '@etherealengine/common/src/interfaces/LocationType'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

const logger = multiLogger.child({ component: 'client-core:LocationService' })

//State
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
    const locationTypes = (await API.instance.client.service('location-type').find()) as Paginated<LocationType>
    dispatchAction(AdminLocationActions.locationTypesRetrieved({ locationTypes }))
  },
  patchLocation: async (id: string, location: any) => {
    try {
      const result = await API.instance.client.service('location').patch(id, location)
      dispatchAction(AdminLocationActions.locationPatched({ location: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeLocation: async (id: string) => {
    const result = await API.instance.client.service('location').remove(id)
    dispatchAction(AdminLocationActions.locationRemoved({ location: result }))
  },
  createLocation: async (location: any) => {
    try {
      const result = await API.instance.client.service('location').create(location)
      dispatchAction(AdminLocationActions.locationCreated({ location: result }))
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

      const locations = (await API.instance.client.service('location').find({
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
      dispatchAction(AdminLocationActions.locationsRetrieved({ locations }))
    } catch (error) {
      logger.error(error)
    }
  },
  searchAdminLocations: async (value, orderBy = 'asc') => {
    try {
      const locations = (await API.instance.client.service('location').find({
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

//Action
export class AdminLocationActions {
  static locationsRetrieved = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATIONS_RETRIEVED' as const,
    locations: matches.object as Validator<unknown, Paginated<Location>>
  })

  // static locationRetrieved = defineAction({
  //   type: 'ee.client.AdminLocation.ADMIN_LOCATION_RETRIEVED' as const,
  //   location: matches.object as Validator<unknown, Location>
  // })

  static locationCreated = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATION_CREATED' as const,
    location: matches.object as Validator<unknown, Location>
  })

  static locationPatched = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATION_PATCHED' as const,
    location: matches.object as Validator<unknown, Location>
  })

  static locationRemoved = defineAction({
    type: 'ee.client.AdminLocation.ADMIN_LOCATION_REMOVED' as const,
    location: matches.object as Validator<unknown, Location>
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
    locationTypes: matches.object as Validator<unknown, Paginated<LocationType>>
  })
}
