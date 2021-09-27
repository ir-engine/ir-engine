import Immutable from 'immutable'
import { LocationTypesRetrievedResponse } from './actions'
import {
  ADMIN_LOCATIONS_RETRIEVED,
  ADMIN_LOCATION_CREATED,
  ADMIN_LOCATION_PATCHED,
  ADMIN_LOCATION_REMOVED
} from '../../actions'
import { ADMIN_LOCATION_TYPES_RETRIEVED } from '../../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { LocationsRetrievedAction } from './actions'
import { match } from 'ts-pattern'

export const LOCATION_PAGE_LIMIT = 100

export const initialLocationAdminState = {
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
}

const immutableState = Immutable.fromJS(initialLocationAdminState) as any

const adminReducer = (state = immutableState, action: any): any => {
  let result: any, updateMap: any

  return match(action)
    .with({ type: ADMIN_LOCATIONS_RETRIEVED }, () => {
      result = (action as LocationsRetrievedAction).locations
      updateMap = new Map(state.get('locations'))
      updateMap.set('locations', result.data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('locations', updateMap)
    })
    .with({ type: ADMIN_LOCATION_CREATED }, () => {
      updateMap = new Map(state.get('locations'))
      updateMap.set('updateNeeded', true)
      updateMap.set('created', true)
      return state.set('locations', updateMap)
    })
    .with({ type: ADMIN_LOCATION_PATCHED }, () => {
      updateMap = new Map(state.get('locations'))
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
      return state.set('locations', updateMap)
    })
    .with({ type: ADMIN_LOCATION_REMOVED }, () => {
      let removedMap = new Map(state.get('locations'))
      removedMap.set('updateNeeded', true)
      return state.set('locations', removedMap)
    })
    .with({ type: ADMIN_LOCATION_TYPES_RETRIEVED }, () => {
      result = (action as LocationTypesRetrievedResponse).types
      updateMap = new Map(state.get('locationTypes'))
      updateMap.set('locationTypes', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('locationTypes', updateMap)
    })
    .otherwise(() => {
      return state
    })

  // switch (action.type) {
  //   case ADMIN_LOCATIONS_RETRIEVED:
  //     result = (action as LocationsRetrievedAction).locations
  //     updateMap = new Map(state.get('locations'))
  //     updateMap.set('locations', result.data)
  //     updateMap.set('skip', (result as any).skip)
  //     updateMap.set('limit', (result as any).limit)
  //     updateMap.set('total', (result as any).total)
  //     updateMap.set('retrieving', false)
  //     updateMap.set('fetched', true)
  //     updateMap.set('updateNeeded', false)
  //     updateMap.set('lastFetched', new Date())
  //     return state.set('locations', updateMap)

  //   case ADMIN_LOCATION_CREATED:
  //     updateMap = new Map(state.get('locations'))
  //     updateMap.set('updateNeeded', true)
  //     updateMap.set('created', true)
  //     return state.set('locations', updateMap)

  //   case ADMIN_LOCATION_PATCHED:
  //     updateMap = new Map(state.get('locations'))
  //     const locations = updateMap.get('locations')

  //     for (let i = 0; i < locations.length; i++) {
  //       if (locations[i].id === (action as any).location.id) {
  //         locations[i] = (action as any).location
  //       } else if ((action as any).location.isLobby && locations[i].isLobby) {
  //         // if updated location is lobby then remove old lobby.
  //         locations[i].isLobby = false
  //       }
  //     }

  //     updateMap.set('locations', locations)
  //     return state.set('locations', updateMap)

  //   case ADMIN_LOCATION_REMOVED:
  //     let removedMap = new Map(state.get('locations'))
  //     removedMap.set('updateNeeded', true)
  //     return state.set('locations', removedMap)

  //   case ADMIN_LOCATION_TYPES_RETRIEVED:
  //     result = (action as LocationTypesRetrievedResponse).types
  //     updateMap = new Map(state.get('locationTypes'))
  //     updateMap.set('locationTypes', result.data)
  //     updateMap.set('updateNeeded', false)
  //     return state.set('locationTypes', updateMap)
  // }

  // return state
}

export default adminReducer
