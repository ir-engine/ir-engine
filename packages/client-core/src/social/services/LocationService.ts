import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { Location, LocationSeed } from '@xrengine/common/src/interfaces/Location'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
const state = createState({
  locationName: null! as string,
  currentLocation: {
    location: LocationSeed as Location,
    bannedUsers: [] as UserId[],
    selfUserBanned: false
  },
  updateNeeded: true,
  currentLocationUpdateNeeded: true,
  fetchingCurrentLocation: false,
  invalidLocation: false
})

store.receptors.push((action: LocationActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOCATION_NAME_SET':
        return s.merge({
          locationName: action.locationName
        })
      case 'FETCH_CURRENT_LOCATION':
        return s.merge({
          fetchingCurrentLocation: true,
          currentLocation: {
            location: LocationSeed as Location,
            bannedUsers: [] as UserId[],
            selfUserBanned: false
          },
          updateNeeded: true,
          currentLocationUpdateNeeded: true
        })
      case 'LOCATION_RETRIEVED':
        let bannedUsers = [] as UserId[]
        ;(action.location as any)?.location_bans?.forEach((ban) => {
          bannedUsers.push(ban.userId)
        })
        bannedUsers = [...new Set(bannedUsers)]
        return s.merge({
          currentLocation: {
            location: {
              ...action.location,
              locationSetting: (action.location as any).location_setting
            },
            bannedUsers,
            selfUserBanned: false
          },
          currentLocationUpdateNeeded: false,
          fetchingCurrentLocation: false
        })

      case 'LOCATION_NOT_FOUND':
        return s.merge({
          currentLocation: {
            location: LocationSeed,
            bannedUsers: [],
            selfUserBanned: false
          },
          currentLocationUpdateNeeded: false,
          fetchingCurrentLocation: false,
          invalidLocation: true
        })

      case 'LOCATION_BAN_CREATED':
        return s.merge({ currentLocationUpdateNeeded: true })

      case 'LOCATION_LOCAL_USER_BANNED':
        s.merge({ currentLocationUpdateNeeded: true })
        s.currentLocation.merge({ selfUserBanned: action.banned })
        return
    }
  }, action.type)
})

export const accessLocationState = () => state

export const useLocationState = () => useState(state) as any as typeof state

//Service
export const LocationService = {
  getLocation: async (locationId: string) => {
    const dispatch = useDispatch()
    try {
      dispatch(LocationAction.fetchingCurrentSocialLocation())
      const location = await client.service('location').get(locationId)
      dispatch(LocationAction.socialLocationRetrieved(location))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getLocationByName: async (locationName: string) => {
    const dispatch = useDispatch()
    dispatch(LocationAction.fetchingCurrentSocialLocation())
    const locationResult = (await client.service('location').find({
      query: {
        slugifiedName: locationName,
        joinableLocations: true
      }
    })) as Paginated<Location>

    if (locationResult && locationResult.total > 0) {
      dispatch(LocationAction.socialLocationRetrieved(locationResult.data[0]))
    } else {
      dispatch(LocationAction.socialLocationNotFound())
    }
  },
  getLobby: async () => {
    const lobbyResult = (await client.service('location').find({
      query: {
        isLobby: true,
        $limit: 1
      }
    })) as Paginated<Location>

    if (lobbyResult && lobbyResult.total > 0) {
      return lobbyResult.data[0]
    } else {
      return null
    }
  },
  banUserFromLocation: async (userId: string, locationId: string) => {
    const dispatch = useDispatch()
    try {
      await client.service('location-ban').create({
        userId: userId,
        locationId: locationId
      })
      dispatch(LocationAction.socialLocationBanCreated())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const LocationAction = {
  setLocationName: (locationName: string) => {
    return {
      type: 'LOCATION_NAME_SET' as const,
      locationName
    }
  },
  socialLocationRetrieved: (location: Location) => {
    return {
      type: 'LOCATION_RETRIEVED' as const,
      location
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
  },
  socialSelfUserBanned: (banned: boolean) => {
    return {
      type: 'LOCATION_LOCAL_USER_BANNED' as const,
      banned
    }
  }
}

export type LocationActionType = ReturnType<typeof LocationAction[keyof typeof LocationAction]>
