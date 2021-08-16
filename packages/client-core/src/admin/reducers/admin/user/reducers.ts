import Immutable from 'immutable'
import {
  userAdminRemovedResponse,
  UserCreatedAction,
  userRoleRetrievedResponse,
  fetchedStaticResourceAction
} from './actions'

import {
  USER_ADMIN_CREATED,
  USER_ADMIN_PATCHED,
  USER_ADMIN_REMOVED,
  USER_SEARCH_ADMIN,
  SINGLE_USER_ADMIN_LOADED,
  STATIC_RESOURCE_RETRIEVED
} from '../../actions'
import {
  USER_ROLE_RETRIEVED,
  USER_ROLE_CREATED,
  USER_ROLE_UPDATED
} from '@xrengine/client-core/src/world/reducers/actions'
// } from "../../actions";
import { ADMIN_LOADED_USERS } from '../../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { LoadedUsersAction } from './actions'

export const PAGE_LIMIT = 100

export const initialAdminState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
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
  },
  staticResource: {
    staticResource: [],
    retrieving: false,
    fetched: false,
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialAdminState)

const adminReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case ADMIN_LOADED_USERS:
      result = (action as LoadedUsersAction).users
      updateMap = new Map(state.get('users'))
      let combinedUsers = state.get('users').get('users')
      ;(result as any).data.forEach((item) => {
        const match = combinedUsers.find((user) => user.id === item.id)
        if (match == null) {
          combinedUsers = combinedUsers.concat(item)
        } else {
          combinedUsers = combinedUsers.map((user) => (user.id === item.id ? item : user))
        }
      })
      updateMap.set('users', combinedUsers)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('users', updateMap)

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

    case USER_ADMIN_REMOVED:
      result = (action as userAdminRemovedResponse).data
      updateMap = new Map(state.get('users'))
      let userRemove = updateMap.get('users')
      userRemove = userRemove.filter((user) => user.id !== result.id)
      updateMap.set('updateNeeded', true)
      updateMap.set('users', userRemove)
      return state.set('users', updateMap)
    case USER_ADMIN_CREATED:
      result = (action as UserCreatedAction).user
      updateMap = new Map(state.get('users'))
      updateMap.set('updateNeeded', true)
      return state.set('users', updateMap)
    case USER_ADMIN_PATCHED:
      result = (action as UserCreatedAction).user
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
    case STATIC_RESOURCE_RETRIEVED:
      result = (action as fetchedStaticResourceAction).staticResource
      updateMap = new Map(state.get('staticResource'))
      updateMap.set('staticResource', (result as any).data)
      updateMap.set('retrieving', false)
      updateMap.set('updateNeeded', false)
      updateMap.set('fetched', true)
      return state.set('staticResource', updateMap)
  }

  return state
}

export default adminReducer
