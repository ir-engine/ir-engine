import { createState, useState, none, Downgraded } from '@hookstate/core'
import { LocationActionType } from './LocationAction'
import { LocationTypesRetrievedResponse } from './../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { LocationsRetrievedAction } from '../actions'
import { Location } from '../../../../../../../common/src/interfaces/Location'
import { match } from 'ts-pattern'

export const LOCATION_PAGE_LIMIT = 100
const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  locations: {
    locations: [] as Array<Location>,
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
    locationTypes: [] as Array<any>,
    updateNeeded: true
  }
})

export const locationReducer = (_, action: LocationActionType) => {
  Promise.resolve().then(() => locationReceptor(action))
  return state.attach(Downgraded).value
}

export const locationReceptor = (action: LocationActionType): void => {
  state.batch((s) => {
    let result: any, updateMap: any

    switch (action.type) {
      case 'ADMIN_LOCATIONS_RETRIEVED':
        result = (action as LocationsRetrievedAction).locations
        updateMap = state.locations
        updateMap.set('locations', result.data)
        updateMap.set('skip', (result as any).skip)
        updateMap.set('limit', (result as any).limit)
        updateMap.set('total', (result as any).total)
        updateMap.set('retrieving', false)
        updateMap.set('fetched', true)
        updateMap.set('updateNeeded', false)
        updateMap.set('lastFetched', new Date())
        return s.merge({ locations: updateMap })

      case 'ADMIN_LOCATION_CREATED':
        updateMap = state.locations
        updateMap.set('updateNeeded', true)
        updateMap.set('created', true)
        return s.merge({ locations: updateMap })

      case 'ADMIN_LOCATION_PATCHED':
        updateMap = state.locations
        const locations = updateMap.get('locations')

        for (let i = 0; i < locations.length; i++) {
          if (locations[i].id === (action as any).location.id) {
            locations[i] = (action as any).location
          } else if ((action as any).location.isLobby && locations[i].isLobby) {
            // if updated location is lobby then remove old lobby.
            locations[i].isLobby = false
          }
        }

        updateMap.set('locations', locations)
        return s.merge({ locations: updateMap })

      case 'ADMIN_LOCATION_REMOVED':
        let removedMap: any = state.locations
        removedMap.set('updateNeeded', true)
        return s.merge({ locations: removedMap })

      case 'ADMIN_LOCATION_TYPES_RETRIEVED':
        result = (action as LocationTypesRetrievedResponse).types
        updateMap = state.locationTypes
        updateMap.set('locationTypes', result.data)
        updateMap.set('updateNeeded', false)
        return s.merge({ locationTypes: updateMap })
    }
  }, action.type)
}

export const accessLocationState = () => state
export const useLocationState = () => useState(state)
