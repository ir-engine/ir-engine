import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/services/AlertService'
import { ErrorAction } from '../../common/services/ErrorService'
import { client } from '../../feathers'

import { createState, useState } from '@hookstate/core'
import { Location } from '@xrengine/common/src/interfaces/Location'
import { LocationType } from '@xrengine/common/src/interfaces/LocationType'

import { LocationResult } from '@xrengine/common/src/interfaces/LocationResult'
import { LocationTypesResult } from '@xrengine/common/src/interfaces/LocationTypesResult'

//State
export const LOCATION_PAGE_LIMIT = 100

const state = createState({
  locations: {
    locations: [] as Array<Location>,
    skip: 0,
    limit: LOCATION_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    created: false,
    lastFetched: Date.now()
  },
  locationTypes: {
    locationTypes: [] as Array<LocationType>,
    updateNeeded: true
  }
})

store.receptors.push((action: LocationActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_LOCATIONS_RETRIEVED':
        return s.locations.merge({
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
        return s.locations.merge({ updateNeeded: true, created: true })
      case 'ADMIN_LOCATION_PATCHED':
        const locationsList = state.locations.locations.value
        for (let i = 0; i < locationsList.length; i++) {
          if (locationsList[i].id === action.location.id) {
            locationsList[i] = action.location
          } else if (action.location.isLobby && locationsList[i].isLobby) {
            // if updated location is lobby then remove old lobby.
            locationsList[i].isLobby = false
          }
        }
        return s.locations.merge({ locations: locationsList })

      case 'ADMIN_LOCATION_REMOVED':
        return s.locations.merge({ updateNeeded: true })

      case 'ADMIN_LOCATION_TYPES_RETRIEVED':
        return s.locationTypes.set({ locationTypes: action.locationTypesResult.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessLocationState = () => state

export const useLocationState = () => useState(state) as any as typeof state

//Service
export const LocationService = {
  fetchLocationTypes: async () => {
    const dispatch = useDispatch()
    {
      const locationTypes = await client.service('location-type').find()
      dispatch(LocationAction.locationTypesRetrieved(locationTypes))
    }
  },
  patchLocation: async (id: string, location: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('location').patch(id, location)
        dispatch(LocationAction.locationPatched(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeLocation: async (id: string) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('location').remove(id)
      dispatch(LocationAction.locationRemoved(result))
    }
  },
  createLocation: async (location: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('location').create(location)
        dispatch(LocationAction.locationCreated(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  fetchAdminLocations: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      try {
        const locations = await client.service('location').find({
          query: {
            $sort: {
              name: 1
            },
            $skip: accessLocationState().locations.skip.value,
            $limit: accessLocationState().locations.limit.value,
            adminnedLocations: true
          }
        })
        dispatch(LocationAction.locationsRetrieved(locations))
      } catch (error) {
        console.error(error)
        dispatch(ErrorAction.setReadScopeError(error.message, error.statusCode))
      }
    }
  }
}

//Action
export const LocationAction = {
  locationsRetrieved: (locations: LocationResult) => {
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
  locationTypesRetrieved: (locationTypesResult: LocationTypesResult) => {
    return {
      type: 'ADMIN_LOCATION_TYPES_RETRIEVED' as const,
      locationTypesResult: locationTypesResult
    }
  }
}

export type LocationActionType = ReturnType<typeof LocationAction[keyof typeof LocationAction]>
