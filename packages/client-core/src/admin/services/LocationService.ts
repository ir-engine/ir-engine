import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { Location } from '@xrengine/common/src/interfaces/Location'
import { LocationType } from '@xrengine/common/src/interfaces/LocationType'

import { AlertService } from '../../common/services/AlertService'
import { ErrorAction } from '../../common/services/ErrorService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
export const LOCATION_PAGE_LIMIT = 100

const state = createState({
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

store.receptors.push((action: LocationActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_LOCATIONS_RETRIEVED':
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
      case 'ADMIN_LOCATION_CREATED':
        return s.merge({ updateNeeded: true, created: true })
      case 'ADMIN_LOCATION_PATCHED':
        return s.merge({ updateNeeded: true })

      case 'ADMIN_LOCATION_REMOVED':
        return s.merge({ updateNeeded: true })
      case 'ADMIN_LOCATION_TYPES_RETRIEVED':
        return s.merge({ locationTypes: action.locationTypes.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessLocationState = () => state

export const useLocationState = () => useState(state) as any as typeof state

//Service
export const LocationService = {
  fetchLocationTypes: async () => {
    const dispatch = useDispatch()

    const locationTypes = (await client.service('location-type').find()) as Paginated<LocationType>
    dispatch(LocationAction.locationTypesRetrieved(locationTypes))
  },
  patchLocation: async (id: string, location: any) => {
    const dispatch = useDispatch()

    try {
      const result = await client.service('location').patch(id, location)
      dispatch(LocationAction.locationPatched(result))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  removeLocation: async (id: string) => {
    const dispatch = useDispatch()

    const result = await client.service('location').remove(id)
    dispatch(LocationAction.locationRemoved(result))
  },
  createLocation: async (location: any) => {
    const dispatch = useDispatch()

    try {
      const result = await client.service('location').create(location)
      dispatch(LocationAction.locationCreated(result))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  fetchAdminLocations: async (
    value: string | null = null,
    skip = accessLocationState().skip.value,
    sortField = 'name',
    orderBy = 'asc'
  ) => {
    const dispatch = useDispatch()

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
      dispatch(LocationAction.locationsRetrieved(locations))
    } catch (error) {
      console.error(error)
      dispatch(ErrorAction.setReadScopeError(error.message, error.statusCode))
    }
  },
  searchAdminLocations: async (value, orderBy = 'asc') => {
    const dispatch = useDispatch()

    try {
      const result = (await client.service('location').find({
        query: {
          search: value,
          $sort: {
            name: orderBy === 'desc' ? 0 : 1
          },
          $skip: accessLocationState().skip.value,
          $limit: accessLocationState().limit.value,
          adminnedLocations: true
        }
      })) as Paginated<Location>
      dispatch(LocationAction.locationsRetrieved(result))
    } catch (error) {
      console.error(error)
      dispatch(ErrorAction.setReadScopeError(error.message, error.statusCode))
    }
  }
}

//Action
export const LocationAction = {
  locationsRetrieved: (locations: Paginated<Location>) => {
    locations.data.forEach((locationData) => {
      if (locationData.location_setting) locationData.locationSetting = locationData.location_setting
    })

    return {
      type: 'ADMIN_LOCATIONS_RETRIEVED' as const,
      locations: locations
    }
  },
  locationRetrieved: (location: Location) => {
    return {
      type: 'ADMIN_LOCATION_RETRIEVED' as const,
      location: location
    }
  },
  locationCreated: (location: Location) => {
    return {
      type: 'ADMIN_LOCATION_CREATED' as const,
      location: location
    }
  },
  locationPatched: (location: Location) => {
    return {
      type: 'ADMIN_LOCATION_PATCHED' as const,
      location: location
    }
  },
  locationRemoved: (location: Location) => {
    return {
      type: 'ADMIN_LOCATION_REMOVED' as const,
      location: location
    }
  },
  locationBanCreated: () => {
    return {
      type: 'ADMIN_LOCATION_BAN_CREATED' as const
    }
  },
  fetchingCurrentLocation: () => {
    return {
      type: 'ADMIN_FETCH_CURRENT_LOCATION' as const
    }
  },
  locationNotFound: () => {
    return {
      type: 'ADMIN_LOCATION_NOT_FOUND' as const
    }
  },
  locationTypesRetrieved: (locationTypes: Paginated<LocationType>) => {
    return {
      type: 'ADMIN_LOCATION_TYPES_RETRIEVED' as const,
      locationTypes: locationTypes
    }
  }
}

export type LocationActionType = ReturnType<typeof LocationAction[keyof typeof LocationAction]>
