import { Paginated } from '@feathersjs/feathers'

import { User } from '@xrengine/common/src/interfaces/User'
import { UserRole } from '@xrengine/common/src/interfaces/UserRole'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const USER_PAGE_LIMIT = 100

const AdminUserRoleState = defineState({
  name: 'AdminUserRoleState',
  initial: () => ({
    skip: 0,
    limit: USER_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now(),
    userRole: [] as Array<UserRole>
  })
})

const userRoleRetrievedReceptor = (action: typeof AdminUserRoleActions.userRoleRetrieved.matches._TYPE) => {
  const state = getState(AdminUserRoleState)
  return state.merge({ userRole: action.types.data, updateNeeded: false })
}

const userRoleCreatedReceptor = (action: typeof AdminUserRoleActions.userRoleCreated.matches._TYPE) => {
  const state = getState(AdminUserRoleState)
  return state.merge({ updateNeeded: true })
}

const userRoleUpdatedReceptor = (action: typeof AdminUserRoleActions.userRoleUpdated.matches._TYPE) => {
  const state = getState(AdminUserRoleState)
  return state.merge({ updateNeeded: true })
}

export const AdminUserRoleReceptors = {
  userRoleRetrievedReceptor,
  userRoleCreatedReceptor,
  userRoleUpdatedReceptor
}

export const accessAdminUserRoleState = () => getState(AdminUserRoleState)

export const useAdminUserRoleState = () => useState(accessAdminUserRoleState())

//Service
export const AdminUserRoleService = {
  fetchUserRole: async () => {
    try {
      const userRole = (await API.instance.client.service('user-role').find()) as Paginated<UserRole>
      dispatchAction(AdminUserRoleActions.userRoleRetrieved({ types: userRole }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createUserRoleAction: async (data) => {
    const result = (await API.instance.client.service('user-role').create(data)) as UserRole
    dispatchAction(AdminUserRoleActions.userRoleCreated({ types: result }))
  },
  updateUserRole: async (id: string, role: string) => {
    try {
      const userRole = (await API.instance.client.service('user').patch(id, { userRole: role })) as User
      dispatchAction(AdminUserRoleActions.userRoleUpdated({ data: userRole }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class AdminUserRoleActions {
  static userRoleRetrieved = defineAction({
    type: 'USER_ROLE_RETRIEVED' as const,
    types: matches.object as Validator<unknown, Paginated<UserRole>>
  })

  static userRoleCreated = defineAction({
    type: 'USER_ROLE_CREATED' as const,
    types: matches.object as Validator<unknown, UserRole>
  })

  static userRoleUpdated = defineAction({
    type: 'USER_ROLE_UPDATED' as const,
    data: matches.object as Validator<unknown, User>
  })
}
