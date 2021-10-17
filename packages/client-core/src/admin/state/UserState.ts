import { UserActionType } from './UserActions'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { StaticResource } from '@xrengine/common/src/interfaces/StaticResource'
import { User } from '@xrengine/common/src/interfaces/User'
import { UserRole } from '@xrengine/common/src/interfaces/UserRole'

export const USER_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  users: {
    users: [] as Array<User>,
    skip: 0,
    limit: USER_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  },
  userRole: {
    userRole: [] as Array<UserRole>,
    skip: 0,
    limit: USER_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  },
  singleUser: {
    singleUser: UserSeed as User,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  },
  staticResource: {
    staticResource: [] as Array<StaticResource>,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  }
})

export const receptor = (action: UserActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_LOADED_USERS':
        result = action.userResult
        return s.users.merge({
          users: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'USER_ROLE_RETRIEVED':
        result = action.types
        return s.userRole.merge({ userRole: result.data, updateNeeded: false })
      case 'USER_ROLE_CREATED':
        return s.userRole.merge({ updateNeeded: true })
      case 'USER_ADMIN_REMOVED':
        result = action.data
        let userRemove = [...s.users.users.value]
        userRemove = userRemove.filter((user) => user.id !== result.id)
        return s.users.merge({ users: userRemove, updateNeeded: true })
      case 'USER_ADMIN_CREATED':
        result = action.user
        return s.users.merge({ updateNeeded: true })
      case 'USER_ADMIN_PATCHED':
        result = action.user
        return s.users.merge({ updateNeeded: true })
      case 'USER_ROLE_UPDATED':
        return s.users.merge({ updateNeeded: true })
      case 'USER_SEARCH_ADMIN':
        result = action.userResult
        return s.users.merge({
          users: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'SINGLE_USER_ADMIN_LOADED':
        result = action.data
        return s.singleUser.merge({ singleUser: result, retrieving: false, fetched: true, updateNeeded: false })
      case 'STATIC_RESOURCE_RETRIEVED':
        result = action.staticResource
        return s.staticResource.merge({
          staticResource: result.data,
          retrieving: false,
          updateNeeded: false,
          fetched: true
        })
      case 'SINGLE_USER_ADMIN_REFETCH':
        return s.singleUser.merge({ updateNeeded: true })
    }
  }, action.type)
}

export const accessUserState = () => state

export const useUserState = () => useState(state) as any as typeof state
