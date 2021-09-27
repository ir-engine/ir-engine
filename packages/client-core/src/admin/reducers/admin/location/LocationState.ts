import { createState, useState, none, Downgraded } from '@hookstate/core'
import { ADMIN_LOCATION_TYPES_RETRIEVED } from '../../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { LocationActionType } from './LocationActions'

export const LOCATION_PAGE_LIMIT = 100

export const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  locations: {
    locations: [],
    skip: 0,
    limit: LOCATION_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    created: false,
    lastFetched: new Date()
  },
  locationTypes: {
    locationTypes: [],
    updateNeeded: true
  }
})

export const adminLocationReducer = (_, action: LocationActionType) => {
  Promise.resolve().then(() => locationReceptor(action))
  return state.attach(Downgraded).value
}

const locationReceptor = (action: LocationActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_LOCATIONS_RETRIEVED':
        result = action.locations
        return s.locations.merge({
          locations: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: new Date()
        })
      case 'ADMIN_LOCATION_CREATED':
        return s.locations.merge({ updateNeeded: true, created: true })
      case 'ADMIN_LOCATION_PATCHED':
        const locationsList = state.locations.locations.value
        for (let i = 0; i < locationsList.length; i++) {
          if (locationsList[i].id === (action as any).location.id) {
            locationsList[i] = (action as any).location
          } else if ((action as any).location.isLobby && locationsList[i].isLobby) {
            // if updated location is lobby then remove old lobby.
            locationsList[i].isLobby = false
          }
        }
        return s.locations.merge({ locations: locationsList })

      case 'ADMIN_LOCATION_REMOVED':
        return s.locations.merge({ updateNeeded: true })

      case 'ADMIN_LOCATION_TYPES_RETRIEVED':
        result = action.types
        return s.locationTypes.set({ locationTypes: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessLocationState = () => state
export const useLocationState = () => useState(state)
