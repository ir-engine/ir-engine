import { Paginated } from '@feathersjs/feathers'

import { Location } from '@xrengine/common/src/interfaces/Location'
import { LocationType } from '@xrengine/common/src/interfaces/LocationType'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { ErrorAction } from '../../common/services/ErrorService'
import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'

//State
export const LOCATION_PAGE_LIMIT = 100

const AdminLocationState = defineState({
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

export const AdminLocationServiceReceptor = (action) => {
  getState(AdminLocationState).batch((s) => {
    matches(action)
      .when(AdminLocationActions.locationsRetrieved.matches, (action) => {
        return s.merge({
          locations: action.locations.data,
          skip: action.locations.skip,
          limit: action.locations.limit,
          total: action.locations.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      })
      .when(AdminLocationActions.locationCreated.matches, (action) => {
        return s.merge({ updateNeeded: true, created: true })
      })
      .when(AdminLocationActions.locationPatched.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
      .when(AdminLocationActions.locationRemoved.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
      .when(AdminLocationActions.locationTypesRetrieved.matches, (action) => {
        return s.merge({ locationTypes: action.locationTypes.data, updateNeeded: false })
      })
  })
}

export const accessAdminLocationState = () => getState(AdminLocationState)

export const useADminLocationState = () => useState(accessAdminLocationState())

//Service
export const AdminLocationService = {
  fetchLocationTypes: async () => {
    const locationTypes = (await client.service('location-type').find()) as Paginated<LocationType>
    dispatchAction(AdminLocationActions.locationTypesRetrieved({ locationTypes }))
  },
  patchLocation: async (id: string, location: any) => {
    try {
      const result = await client.service('location').patch(id, location)
      dispatchAction(AdminLocationActions.locationPatched({ location: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeLocation: async (id: string) => {
    const result = await client.service('location').remove(id)
    dispatchAction(AdminLocationActions.locationRemoved({ location: result }))
  },
  createLocation: async (location: any) => {
    try {
      const result = await client.service('location').create(location)
      dispatchAction(AdminLocationActions.locationCreated({ location: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchAdminLocations: async (
    value: string | null = null,
    skip = accessAdminLocationState().skip.value,
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

      const locations = (await client.service('location').find({
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
      console.error(error)
      dispatchAction(ErrorAction.setReadScopeError(error.message, error.statusCode))
    }
  },
  searchAdminLocations: async (value, orderBy = 'asc') => {
    try {
      const locations = (await client.service('location').find({
        query: {
          search: value,
          $sort: {
            name: orderBy === 'desc' ? 0 : 1
          },
          $skip: accessAdminLocationState().skip.value,
          $limit: accessAdminLocationState().limit.value,
          adminnedLocations: true
        }
      })) as Paginated<Location>
      locations.data.forEach((locationData) => {
        if (locationData.location_setting) locationData.locationSetting = locationData.location_setting
      })
      dispatchAction(AdminLocationActions.locationsRetrieved({ locations }))
    } catch (error) {
      console.error(error)
      dispatchAction(ErrorAction.setReadScopeError(error.message, error.statusCode))
    }
  }
}

//Action
export class AdminLocationActions {
  static locationsRetrieved = defineAction({
    type: 'ADMIN_LOCATIONS_RETRIEVED' as const,
    locations: matches.object as Validator<unknown, Paginated<Location>>
  })

  // static locationRetrieved = defineAction({
  //   type: 'ADMIN_LOCATION_RETRIEVED' as const,
  //   location: matches.object as Validator<unknown, Location>
  // })

  static locationCreated = defineAction({
    type: 'ADMIN_LOCATION_CREATED' as const,
    location: matches.object as Validator<unknown, Location>
  })

  static locationPatched = defineAction({
    type: 'ADMIN_LOCATION_PATCHED' as const,
    location: matches.object as Validator<unknown, Location>
  })

  static locationRemoved = defineAction({
    type: 'ADMIN_LOCATION_REMOVED' as const,
    location: matches.object as Validator<unknown, Location>
  })

  // static locationBanCreated = defineAction({
  //   type: 'ADMIN_LOCATION_BAN_CREATED' as const
  // })

  // static fetchingCurrentLocation = defineAction({
  //   type: 'ADMIN_FETCH_CURRENT_LOCATION' as const
  // })

  // static locationNotFound = defineAction({
  //   type: 'ADMIN_LOCATION_NOT_FOUND' as const
  // })

  static locationTypesRetrieved = defineAction({
    type: 'ADMIN_LOCATION_TYPES_RETRIEVED' as const,
    locationTypes: matches.object as Validator<unknown, Paginated<LocationType>>
  })
}
