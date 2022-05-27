import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { CreateEditUser, User } from '@xrengine/common/src/interfaces/User'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const USER_PAGE_LIMIT = 100

const state = createState({
  users: [] as Array<User>,
  skip: 0,
  limit: USER_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  skipGuests: false,
  userRole: null,
  lastFetched: 0
})

store.receptors.push((action: UserActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_LOADED_USERS':
        return s.merge({
          users: action.userResult.data,
          skip: action.userResult.skip,
          limit: action.userResult.limit,
          total: action.userResult.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'USER_ADMIN_REMOVED':
        return s.merge({ updateNeeded: true })
      case 'USER_ADMIN_CREATED':
        return s.merge({ updateNeeded: true })
      case 'USER_ADMIN_PATCHED':
        return s.merge({ updateNeeded: true })
      case 'USER_SEARCH_ADMIN':
        return s.merge({
          users: action.userResult.data,
          skip: action.userResult.skip,
          limit: action.userResult.limit,
          total: action.userResult.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'SET_SKIP_GUESTS':
        return s.merge({
          skipGuests: action.skipGuests,
          updateNeeded: true
        })
      case 'SET_USER_ROLE':
        return s.merge({
          userRole: action.userRole,
          updateNeeded: true
        })
      case 'RESET_USER_FILTER':
        return s.merge({
          userRole: null,
          skipGuests: false,
          updateNeeded: true
        })
    }
  }, action.type)
})

export const accessUserState = () => state

export const useUserState = () => useState(state) as any as typeof state

//Service
export const UserService = {
  fetchUsersAsAdmin: async (value: string | null = null, skip = 0, sortField = 'name', orderBy = 'asc') => {
    const dispatch = useDispatch()

    const userState = accessUserState()
    const user = accessAuthState().user
    const skipGuests = userState.skipGuests.value
    const userRole = userState.userRole.value
    try {
      if (user.userRole.value === 'admin') {
        let sortData = {}

        if (sortField.length > 0) {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }

        const params = {
          query: {
            $sort: {
              ...sortData
            },
            $skip: skip * USER_PAGE_LIMIT,
            $limit: USER_PAGE_LIMIT,
            action: 'admin',
            search: value
          }
        }
        if (skipGuests) {
          ;(params.query as any).userRole = {
            $ne: 'guest'
          }
        }
        if (userRole) {
          ;(params.query as any).userRole = {
            $eq: userRole
          }
        }
        const users = (await client.service('user').find(params)) as Paginated<User>
        dispatch(UserAction.loadedUsers(users))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createUser: async (user: CreateEditUser) => {
    const dispatch = useDispatch()

    try {
      const result = (await client.service('user').create(user)) as User
      dispatch(UserAction.userCreated(result))
    } catch (err) {
      console.log(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchUser: async (id: string, user: CreateEditUser) => {
    const dispatch = useDispatch()

    try {
      const result = (await client.service('user').patch(id, user)) as User
      dispatch(UserAction.userPatched(result))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeUserAdmin: async (id: string) => {
    const dispatch = useDispatch()

    const result = (await client.service('user').remove(id)) as User
    dispatch(UserAction.userAdminRemoved(result))
  },
  searchUserAction: async (data: any) => {
    const dispatch = useDispatch()

    try {
      const userState = accessUserState()
      const skip = userState.skip.value
      const limit = userState.limit.value
      const result = (await client.service('user').find({
        query: {
          $sort: {
            name: 1
          },
          $skip: skip || 0,
          $limit: limit,
          action: 'search',
          data
        }
      })) as Paginated<User>
      dispatch(UserAction.searchedUser(result))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  refetchSingleUserAdmin: async () => {},
  setSkipGuests: async (value: boolean) => {
    const dispatch = useDispatch()
    dispatch(UserAction.setSkipGuests(value))
  },
  setUserRole: async (value: string) => {
    const dispatch = useDispatch()
    dispatch(UserAction.setUserRole(value))
  },
  resetFilter: () => {
    const dispatch = useDispatch()
    dispatch(UserAction.resetFilter())
  }
}

//Action
export const UserAction = {
  loadedUsers: (userResult: Paginated<User>) => {
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
  userAdminRemoved: (data: User) => {
    return {
      type: 'USER_ADMIN_REMOVED' as const,
      data: data
    }
  },
  searchedUser: (userResult: Paginated<User>) => {
    return {
      type: 'USER_SEARCH_ADMIN' as const,
      userResult: userResult
    }
  },
  setSkipGuests: (skipGuests: boolean) => {
    return {
      type: 'SET_SKIP_GUESTS' as const,
      skipGuests: skipGuests
    }
  },
  setUserRole: (userRole: any) => {
    return {
      type: 'SET_USER_ROLE' as const,
      userRole: userRole
    }
  },
  resetFilter: () => {
    return {
      type: 'RESET_USER_FILTER' as const
    }
  }
}

export type UserActionType = ReturnType<typeof UserAction[keyof typeof UserAction]>
