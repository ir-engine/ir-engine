import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { StaticResource } from '@xrengine/common/src/interfaces/StaticResource'
import { UserRole } from '@xrengine/common/src/interfaces/UserRole'
import { User } from '@xrengine/common/src/interfaces/User'
import { UserResult } from '@xrengine/common/src/interfaces/UserResult'
import { StaticResourceResult } from '@xrengine/common/src/interfaces/StaticResourceResult'
import { UserRoleResult } from '@xrengine/common/src/interfaces/UserRoleResult'

//State
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

store.receptors.push((action: UserActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_LOADED_USERS':
        result = action.userResult
        return s.merge({
          users: {
            users: result.data,
            skip: result.skip,
            limit: result.limit,
            total: result.total,
            retrieving: false,
            fetched: true,
            updateNeeded: false,
            lastFetched: Date.now()
          }
        })
      case 'USER_ROLE_RETRIEVED':
        result = action.types
        return s.merge({
          userRole: {
            ...s.userRole.value,
            userRole: result.data,
            updateNeeded: false
          }
        })
      case 'USER_ROLE_CREATED':
        return s.merge({
          userRole: {
            ...s.userRole.value,
            updateNeeded: true
          }
        })
      case 'USER_ADMIN_REMOVED':
        result = action.data
        let userRemove = [...s.users.users.value]
        userRemove = userRemove.filter((user) => user.id !== result.id)
        return s.merge({
          users: {
            ...s.users.value,
            users: userRemove,
            updateNeeded: true
          }
        })
      case 'USER_ADMIN_CREATED':
        result = action.user
        return s.merge({
          users: {
            ...s.users.value,
            updateNeeded: true
          }
        })
      case 'USER_ADMIN_PATCHED':
        result = action.user
        return s.merge({
          users: {
            ...s.users.value,
            updateNeeded: true
          }
        })
      case 'USER_ROLE_UPDATED':
        return s.merge({
          users: {
            ...s.users.value,
            updateNeeded: true
          }
        })
      case 'USER_SEARCH_ADMIN':
        result = action.userResult
        return s.merge({
          users: {
            users: result.data,
            skip: result.skip,
            limit: result.limit,
            total: result.total,
            retrieving: false,
            fetched: true,
            updateNeeded: false,
            lastFetched: Date.now()
          }
        })
      case 'SINGLE_USER_ADMIN_LOADED':
        result = action.data
        return s.merge({
          singleUser: {
            singleUser: result,
            retrieving: false,
            fetched: true,
            updateNeeded: false
          }
        })
      case 'STATIC_RESOURCE_RETRIEVED':
        result = action.staticResource
        return s.merge({
          staticResource: {
            staticResource: result.data,
            retrieving: false,
            updateNeeded: false,
            fetched: true
          }
        })
      case 'SINGLE_USER_ADMIN_REFETCH':
        return s.merge({
          singleUser: {
            ...s.singleUser.value,
            updateNeeded: true
          }
        })
    }
  }, action.type)
})

export const accessUserState = () => state

export const useUserState = () => useState(state) as any as typeof state

//Service
export const UserService = {
  fetchUsersAsAdmin: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const userState = accessUserState()
      const skip = userState.users.skip.value
      const limit = userState.users.limit.value
      try {
        if (userState.userRole.userRole.findIndex((r) => r.role.value === 'admin') !== -1) {
          const users = await client.service('user').find({
            query: {
              $sort: {
                name: 1
              },
              $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
              $limit: limit,
              action: 'admin'
            }
          })
          dispatch(UserAction.loadedUsers(users))
        }
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  createUser: async (user: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('user').create(user)
        dispatch(UserAction.userCreated(result))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  patchUser: async (id: string, user: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('user').patch(id, user)
        dispatch(UserAction.userPatched(result))
      } catch (error) {
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  removeUserAdmin: async (id: string) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('user').remove(id)
      dispatch(UserAction.userAdminRemoved(result))
    }
  },
  fetchUserRole: async () => {
    const dispatch = useDispatch()
    {
      try {
        const userRole = await client.service('user-role').find()
        dispatch(UserAction.userRoleRetrieved(userRole))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  createUserRoleAction: async (data) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('user-role').create(data)
      dispatch(UserAction.userRoleCreated(result))
    }
  },
  updateUserRole: async (id: string, role: string) => {
    const dispatch = useDispatch()
    {
      try {
        const userRole = await client.service('user').patch(id, { userRole: role })
        dispatch(UserAction.userRoleUpdated(userRole))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  searchUserAction: async (data: any) => {
    const dispatch = useDispatch()
    {
      try {
        const userState = accessUserState()
        const skip = userState.users.skip.value
        const limit = userState.users.limit.value
        const result = await client.service('user').find({
          query: {
            $sort: {
              name: 1
            },
            $skip: skip || 0,
            $limit: limit,
            action: 'search',
            data
          }
        })
        dispatch(UserAction.searchedUser(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  fetchSingleUserAdmin: async (id: string) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('user').get(id)
        dispatch(UserAction.fetchedSingleUser(result))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  fetchStaticResource: async () => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('static-resource').find({
          query: {
            staticResourceType: 'avatar'
          }
        })
        dispatch(UserAction.fetchedStaticResource(result))
      } catch (error) {
        console.error(error)
      }
    }
  },
  refetchSingleUserAdmin: async () => { }
}

//Action
export const UserAction = {
  loadedUsers: (userResult: UserResult) => {
    return {
      type: 'ADMIN_LOADED_USERS' as const,
      userResult: userResult
    }
  },
  userCreated: (user: User) => {
    return {
      type: 'USER_ADMIN_CREATED' as const,
      user: user
    }
  },
  userPatched: (user: User) => {
    return {
      type: 'USER_ADMIN_PATCHED' as const,
      user: user
    }
  },
  userRoleRetrieved: (data: UserRoleResult) => {
    return {
      type: 'USER_ROLE_RETRIEVED' as const,
      types: data
    }
  },
  userRoleCreated: (data: UserRole) => {
    return {
      type: 'USER_ROLE_CREATED' as const,
      types: data
    }
  },
  userAdminRemoved: (data: User) => {
    return {
      type: 'USER_ADMIN_REMOVED' as const,
      data: data
    }
  },
  userRoleUpdated: (data: User) => {
    return {
      type: 'USER_ROLE_UPDATED' as const,
      data: data
    }
  },
  searchedUser: (userResult: UserResult) => {
    return {
      type: 'USER_SEARCH_ADMIN' as const,
      userResult: userResult
    }
  },
  fetchedSingleUser: (data: User) => {
    return {
      type: 'SINGLE_USER_ADMIN_LOADED' as const,
      data: data
    }
  },
  fetchedStaticResource: (data: StaticResourceResult) => {
    return {
      type: 'STATIC_RESOURCE_RETRIEVED' as const,
      staticResource: data
    }
  },
  refetchSingleUser: () => {
    return {
      type: 'SINGLE_USER_ADMIN_REFETCH' as const
    }
  }
}

export type UserActionType = ReturnType<typeof UserAction[keyof typeof UserAction]>
