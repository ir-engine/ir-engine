import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { createState, useState } from '@speigg/hookstate'
import { User } from '@xrengine/common/src/interfaces/User'
import { UserResult } from '@xrengine/common/src/interfaces/UserResult'
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
        let userRemove = [...s.users.value]
        userRemove = userRemove.filter((user) => user.id !== action.data.id)
        return s.merge({ users: userRemove, updateNeeded: true })
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
      const user = accessAuthState().user
      const skip = userState.skip.value
      const limit = userState.limit.value
      const skipGuests = userState.skipGuests.value
      try {
        if (user.userRole.value === 'admin') {
          const params = {
            query: {
              $sort: {
                name: 1
              },
              $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
              $limit: limit,
              action: 'admin',
              userRole: null! as {}
            }
          }
          if (skipGuests) {
            params.query.userRole = {
              $ne: 'guest'
            }
          }
          const users = await client.service('user').find(params)
          dispatch(UserAction.loadedUsers(users))
        }
      } catch (err) {
        AlertService.dispatchAlertError(err)
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
  searchUserAction: async (data: any) => {
    const dispatch = useDispatch()
    {
      try {
        const userState = accessUserState()
        const skip = userState.skip.value
        const limit = userState.limit.value
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
        AlertService.dispatchAlertError(err)
      }
    }
  },
  refetchSingleUserAdmin: async () => {},
  setSkipGuests: async (value: boolean) => {
    const dispatch = useDispatch()
    dispatch(UserAction.setSkipGuests(value))
  }
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
  userAdminRemoved: (data: User) => {
    return {
      type: 'USER_ADMIN_REMOVED' as const,
      data: data
    }
  },
  searchedUser: (userResult: UserResult) => {
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
  }
}

export type UserActionType = ReturnType<typeof UserAction[keyof typeof UserAction]>
