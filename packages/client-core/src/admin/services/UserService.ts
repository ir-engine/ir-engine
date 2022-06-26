import { Paginated } from '@feathersjs/feathers'

import { CreateEditUser, User, UserSeed } from '@xrengine/common/src/interfaces/User'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const USER_PAGE_LIMIT = 10
const AdminUserState = defineState({
  name: 'AdminUserState',
  initial: () => ({
    users: [] as Array<User>,
    singleUser: UserSeed as User,
    skip: 0,
    limit: USER_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    skipGuests: false,
    userRole: null! as string,
    lastFetched: 0
  })
})

const fetchedSingleUserReceptor = (action: typeof AdminUserActions.fetchedSingleUser.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({ singleUser: action.data, updateNeeded: false })
}

const loadedUsersReceptor = (action: typeof AdminUserActions.loadedUsers.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({
    users: action.userResult.data,
    skip: action.userResult.skip,
    limit: action.userResult.limit,
    total: action.userResult.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const userAdminRemovedReceptor = (action: typeof AdminUserActions.userAdminRemoved.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({ updateNeeded: true })
}

const userCreatedReceptor = (action: typeof AdminUserActions.userCreated.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({ updateNeeded: true })
}

const userPatchedReceptor = (action: typeof AdminUserActions.userPatched.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({ updateNeeded: true })
}

const searchedUserReceptor = (action: typeof AdminUserActions.searchedUser.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({
    users: action.userResult.data,
    skip: action.userResult.skip,
    limit: action.userResult.limit,
    total: action.userResult.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const setSkipGuestsReceptor = (action: typeof AdminUserActions.setSkipGuests.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({
    skipGuests: action.skipGuests,
    updateNeeded: true
  })
}

const setUserRoleReceptor = (action: typeof AdminUserActions.setUserRole.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({
    userRole: action.userRole,
    updateNeeded: true
  })
}

const resetFilterReceptor = (action: typeof AdminUserActions.resetFilter.matches._TYPE) => {
  const state = getState(AdminUserState)
  return state.merge({
    userRole: null!,
    skipGuests: false,
    updateNeeded: true
  })
}

export const AdminUserReceptors = {
  fetchedSingleUserReceptor,
  loadedUsersReceptor,
  userAdminRemovedReceptor,
  userCreatedReceptor,
  userPatchedReceptor,
  searchedUserReceptor,
  setSkipGuestsReceptor,
  setUserRoleReceptor,
  resetFilterReceptor
}

export const accessUserState = () => getState(AdminUserState)

export const useUserState = () => useState(accessUserState())

//Service
export const AdminUserService = {
  fetchSingleUserAdmin: async (id: string) => {
    try {
      const result = await API.instance.client.service('user').get(id)
      dispatchAction(AdminUserActions.fetchedSingleUser({ data: result }))
    } catch (err) {
      console.log(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchUsersAsAdmin: async (value: string | null = null, skip = 0, sortField = 'name', orderBy = 'asc') => {
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
        const userResult = (await API.instance.client.service('user').find(params)) as Paginated<User>
        dispatchAction(AdminUserActions.loadedUsers({ userResult }))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createUser: async (user: CreateEditUser) => {
    try {
      const result = (await API.instance.client.service('user').create(user)) as User
      dispatchAction(AdminUserActions.userCreated({ user: result }))
    } catch (err) {
      console.log(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchUser: async (id: string, user: CreateEditUser) => {
    try {
      const result = (await API.instance.client.service('user').patch(id, user)) as User
      dispatchAction(AdminUserActions.userPatched({ user: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeUserAdmin: async (id: string) => {
    const result = (await API.instance.client.service('user').remove(id)) as User
    dispatchAction(AdminUserActions.userAdminRemoved({ data: result }))
  },
  searchUserAction: async (data: any) => {
    try {
      const userState = accessUserState()
      const skip = userState.skip.value
      const limit = userState.limit.value
      const userResult = (await API.instance.client.service('user').find({
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
      dispatchAction(AdminUserActions.searchedUser({ userResult }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  setSkipGuests: async (skipGuests: boolean) => {
    dispatchAction(AdminUserActions.setSkipGuests({ skipGuests }))
  },
  setUserRole: async (userRole: string) => {
    dispatchAction(AdminUserActions.setUserRole({ userRole }))
  },
  resetFilter: () => {
    dispatchAction(AdminUserActions.resetFilter())
  }
}

//Action
export class AdminUserActions {
  static fetchedSingleUser = defineAction({
    type: 'SINGLE_USER_ADMIN_LOADED' as const,
    data: matches.object as Validator<unknown, User>
  })

  static loadedUsers = defineAction({
    type: 'ADMIN_LOADED_USERS' as const,
    userResult: matches.object as Validator<unknown, Paginated<User>>
  })

  static userCreated = defineAction({
    type: 'USER_ADMIN_CREATED' as const,
    user: matches.object as Validator<unknown, User>
  })

  static userPatched = defineAction({
    type: 'USER_ADMIN_PATCHED' as const,
    user: matches.object as Validator<unknown, User>
  })

  static userAdminRemoved = defineAction({
    type: 'USER_ADMIN_REMOVED' as const,
    data: matches.object as Validator<unknown, User>
  })

  static searchedUser = defineAction({
    type: 'USER_SEARCH_ADMIN' as const,
    userResult: matches.object as Validator<unknown, Paginated<User>>
  })

  static setSkipGuests = defineAction({
    type: 'SET_SKIP_GUESTS' as const,
    skipGuests: matches.boolean
  })

  static setUserRole = defineAction({
    type: 'SET_USER_ROLE' as const,
    userRole: matches.string
  })

  static resetFilter = defineAction({
    type: 'RESET_USER_FILTER' as const
  })
}
