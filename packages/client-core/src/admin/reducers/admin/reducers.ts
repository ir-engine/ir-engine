import Immutable from 'immutable'
import {
  InstanceRemovedResponse,
  InstancesRetrievedResponse,
  LocationTypesRetrievedResponse,
  partyAdminCreatedResponse,
  userAdminRemovedResponse,
  AdminUserCreatedAction,
  userRoleRetrievedResponse,
  VideoCreatedAction
} from './actions'

import {
  VIDEO_CREATED,
  PARTY_ADMIN_CREATED,
  USER_ADMIN_CREATED,
  USER_ADMIN_PATCHED,
  PARTY_ADMIN_DISPLAYED,
  USER_ADMIN_REMOVED,
  USER_SEARCH_ADMIN,
  SINGLE_USER_ADMIN_LOADED,
  SINGLE_USER_ADMIN_REFETCH
} from '../actions'
import {
  LOCATIONS_RETRIEVED,
  LOCATION_CREATED,
  LOCATION_PATCHED,
  LOCATION_REMOVED,
  INSTANCE_REMOVED
} from '../../../social/reducers/actions'
import {
  SCENES_RETRIEVED,
  LOCATION_TYPES_RETRIEVED,
  USER_ROLE_RETRIEVED,
  INSTANCES_RETRIEVED,
  USER_ROLE_CREATED,
  USER_ROLE_UPDATED
} from '../../../world/reducers/actions'
import { ADMIN_LOADED_USERS } from '../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { LoadedUsersAction } from './user/actions'
import { CollectionsFetchedAction } from '../../../world/reducers/scenes/actions'
import { LocationsRetrievedAction } from '../../../social/reducers/location/actions'

export const PAGE_LIMIT = 100

export const initialAdminState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  locations: {
    locations: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  locationTypes: {
    locationTypes: [],
    updateNeeded: true
  },
  scenes: {
    scenes: [],
    skip: 0,
    limit: 1000,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  users: {
    users: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  instances: {
    instances: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  parties: {
    parties: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  userRole: {
    userRole: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  },
  singleUser: {
    singleUser: {},
    retrieving: false,
    fetched: false,
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialAdminState)

const adminReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case VIDEO_CREATED:
      return state.set('data', (action as VideoCreatedAction).data)

    case LOCATIONS_RETRIEVED:
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

    case LOCATION_CREATED:
      updateMap = new Map(state.get('locations'))
      updateMap.set('updateNeeded', true)
      return state.set('locations', updateMap)

    case LOCATION_PATCHED:
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

    case LOCATION_REMOVED:
      updateMap = new Map(state.get('locations'))
      updateMap.set('updateNeeded', true)
      return state.set('locations', updateMap)

    case ADMIN_LOADED_USERS:
      result = (action as LoadedUsersAction).users
      updateMap = new Map(state.get('users'))
      updateMap.set('users', (result as any).data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('users', updateMap)

    case INSTANCES_RETRIEVED:
      result = (action as InstancesRetrievedResponse).instances
      updateMap = new Map(state.get('instances'))
      updateMap.set('instances', (result as any).data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('instances', updateMap)

    case SCENES_RETRIEVED:
      result = (action as CollectionsFetchedAction).collections
      updateMap = new Map(state.get('scenes'))
      updateMap.set('scenes', (result as any).data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('scenes', updateMap)

    case LOCATION_TYPES_RETRIEVED:
      result = (action as LocationTypesRetrievedResponse).types
      updateMap = new Map(state.get('locationTypes'))
      updateMap.set('locationTypes', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('locationTypes', updateMap)

    case INSTANCE_REMOVED:
      result = (action as InstanceRemovedResponse).instance
      updateMap = new Map(state.get('instances'))
      let instances = updateMap.get('instances')
      instances = instances.filter((instance) => instance.id !== result.id)
      updateMap.set('instances', instances)
      return state.set('instances', updateMap)

    case USER_ROLE_RETRIEVED:
      result = (action as userRoleRetrievedResponse).types
      updateMap = new Map(state.get('userRole'))
      updateMap.set('userRole', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('userRole', updateMap)

    case USER_ROLE_CREATED:
      updateMap = new Map(state.get('userRole'))
      updateMap.set('updateNeeded', true)
      return state.set('userRole', updateMap)

    case PARTY_ADMIN_DISPLAYED:
      result = (action as partyAdminCreatedResponse).data
      updateMap = new Map(state.get('parties'))
      updateMap.set('parties', result)
      updateMap.set('updateNeeded', false)
      return state.set('parties', updateMap)

    case PARTY_ADMIN_CREATED:
      updateMap = new Map(state.get('parties'))
      updateMap.set('updateNeeded', true)
      return state.set('parties', updateMap)

    case USER_ADMIN_REMOVED:
      result = (action as userAdminRemovedResponse).data
      updateMap = new Map(state.get('users'))
      let userRemove = updateMap.get('users')
      userRemove = userRemove.filter((user) => user.id !== result.id)
      updateMap.set('updateNeeded', true)
      updateMap.set('users', userRemove)
      return state.set('users', updateMap)
    case USER_ADMIN_CREATED:
      result = (action as AdminUserCreatedAction).user
      updateMap = new Map(state.get('users'))
      updateMap.set('updateNeeded', true)
      return state.set('users', updateMap)
    case USER_ADMIN_PATCHED:
      result = (action as AdminUserCreatedAction).user
      updateMap = new Map(state.get('users'))
      updateMap.set('updateNeeded', true)
      return state.set('users', updateMap)
    case USER_ROLE_UPDATED:
      updateMap = new Map(state.get('users'))
      updateMap.set('updateNeeded', true)
      return state.set('users', updateMap)
    case USER_SEARCH_ADMIN:
      result = (action as any).data
      updateMap = new Map(state.get('users'))
      updateMap.set('users', (result as any).data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('users', updateMap)
    case SINGLE_USER_ADMIN_LOADED:
      result = (action as any).data
      updateMap = new Map(state.get('singleUser'))
      updateMap.set('singleUser', result)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      return state.set('singleUser', updateMap)
    case SINGLE_USER_ADMIN_REFETCH:
      updateMap = new Map(state.get('singleUser'))
      updateMap.set('updateNeeded', true)
      return state.set('singleUser', updateMap)
  }

  return state
}

export default adminReducer
