import { AlertService } from '../../common/state/AlertService'
import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import waitForClientAuthenticated from '../../util/wait-for-client-authenticated'
import { LocationResult } from '@xrengine/common/src/interfaces/LocationResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { Location, LocationSeed } from '@xrengine/common/src/interfaces/Location'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

//State
const state = createState({
  locations: {
    locations: [] as Location[],
    total: 0,
    limit: 10,
    skip: 0
  },
  currentLocation: {
    location: LocationSeed as Location,
    bannedUsers: [] as UserId[]
  },
  updateNeeded: true,
  currentLocationUpdateNeeded: true,
  fetchingCurrentLocation: false,
  invalidLocation: false
})

store.receptors.push((action: LocationActionType): any => {
  let newValues, updateMap
  state.batch((s) => {
    switch (action.type) {
      case 'LOCATIONS_RETRIEVED':
        newValues = action.locations

        if (s.locations.locations == null || s.updateNeeded.value === true) {
          s.locations.locations.set(newValues.data)
        } else {
          s.locations.locations.set([...s.locations.locations.value, ...newValues.data])
        }

        s.locations.skip.set(newValues.skip)
        s.locations.limit.set(newValues.limit)
        s.locations.total.set(newValues.total)
        return s.updateNeeded.set(false)

      case 'FETCH_CURRENT_LOCATION':
        return s.fetchingCurrentLocation.set(true)

      case 'LOCATION_RETRIEVED':
        newValues = action.location
        newValues.locationSettings = newValues.location_setting

        let bannedUsers = [] as UserId[]
        newValues?.location_bans?.forEach((ban) => {
          bannedUsers.push(ban.userId)
        })
        bannedUsers = [...new Set(bannedUsers)]

        s.currentLocation.location.set(newValues)
        s.currentLocation.bannedUsers.set(bannedUsers)
        s.currentLocationUpdateNeeded.set(false)
        return s.fetchingCurrentLocation.set(false)

      case 'LOCATION_NOT_FOUND':
        s.currentLocation.merge({ location: LocationSeed, bannedUsers: [] })
        s.currentLocationUpdateNeeded.set(false)
        s.fetchingCurrentLocation.set(false)
        return s.invalidLocation.set(true)

      case 'LOCATION_BAN_CREATED':
        return s.currentLocationUpdateNeeded.set(true)
    }
  }, action.type)
})

export const accessLocationState = () => state

export const useLocationState = () => useState(state) as any as typeof state

//Service
export const LocationService = {
  getLocations: async (skip?: number, limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        const locationState = accessLocationState()
        await waitForClientAuthenticated()
        const locationResults = await client.service('location').find({
          query: {
            $limit: limit != null ? limit : locationState.locations.limit.value,
            $skip: skip != null ? skip : locationState.locations.skip.value,
            joinableLocations: true
          }
        })
        dispatch(LocationAction.socialLocationsRetrieved(locationResults))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getLocation: async (locationId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(LocationAction.fetchingCurrentSocialLocation())
        const location = await client.service('location').get(locationId)
        dispatch(LocationAction.socialLocationRetrieved(location))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getLocationByName: async (locationName: string) => {
    const dispatch = useDispatch()
    {
      const locationResult = await client
        .service('location')
        .find({
          query: {
            slugifiedName: locationName,
            joinableLocations: true
          }
        })
        .catch((error) => {
          console.log("Couldn't get location by name", error)
        })
      if (locationResult && locationResult.total > 0) {
        dispatch(LocationAction.socialLocationRetrieved(locationResult.data[0]))
      } else {
        dispatch(LocationAction.socialLocationNotFound())
      }
    }
  },
  getLobby: async () => {
    const lobbyResult = await client
      .service('location')
      .find({
        query: {
          isLobby: true,
          $limit: 1
        }
      })
      .catch((error) => {
        console.log("Couldn't get Lobby", error)
      })

    if (lobbyResult && lobbyResult.total > 0) {
      return lobbyResult.data[0]
    }
  },
  banUserFromLocation: async (userId: string, locationId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('location-ban').create({
          userId: userId,
          locationId: locationId
        })
        dispatch(LocationAction.socialLocationBanCreated())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
export const LocationAction = {
  socialLocationsRetrieved: (locations: LocationResult) => {
    return {
      type: 'LOCATIONS_RETRIEVED' as const,
      locations: locations
    }
  },
  socialLocationRetrieved: (location: Location) => {
    return {
      type: 'LOCATION_RETRIEVED' as const,
      location: location
    }
  },
  socialLocationCreated: (location: Location) => {
    return {
      type: 'LOCATION_CREATED' as const,
      location: location
    }
  },
  socialLocationPatched: (location: Location) => {
    return {
      type: 'LOCATION_PATCHED' as const,
      location: location
    }
  },
  socialLocationRemoved: (location: Location) => {
    return {
      type: 'LOCATION_REMOVED' as const,
      location: location
    }
  },
  socialLocationBanCreated: () => {
    return {
      type: 'LOCATION_BAN_CREATED' as const
    }
  },
  fetchingCurrentSocialLocation: () => {
    return {
      type: 'FETCH_CURRENT_LOCATION' as const
    }
  },
  socialLocationNotFound: () => {
    return {
      type: 'LOCATION_NOT_FOUND' as const
    }
  }
}

export type LocationActionType = ReturnType<typeof LocationAction[keyof typeof LocationAction]>
