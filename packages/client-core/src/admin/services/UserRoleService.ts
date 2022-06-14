import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { User } from '@xrengine/common/src/interfaces/User'
import { UserRole } from '@xrengine/common/src/interfaces/UserRole'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
export const USER_PAGE_LIMIT = 100

const state = createState({
  skip: 0,
  limit: USER_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now(),
  userRole: [] as Array<UserRole>
})

store.receptors.push((action: UserActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'USER_ROLE_RETRIEVED':
        return s.merge({ userRole: action.types, updateNeeded: false })
      case 'USER_ROLE_CREATED':
        return s.merge({ updateNeeded: true })
      case 'USER_ROLE_UPDATED':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessUserRoleState = () => state

export const useUserRoleState = () => useState(state) as any as typeof state

//Service
export const UserRoleService = {
  fetchUserRole: async () => {
    const dispatch = useDispatch()

    try {
      const userRole = (await client.service('user-role').find()) as Paginated<UserRole>
      dispatch(UserRoleAction.userRoleRetrieved(userRole))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createUserRoleAction: async (data) => {
    const dispatch = useDispatch()

    const result = (await client.service('user-role').create(data)) as UserRole
    dispatch(UserRoleAction.userRoleCreated(result))
  },
  updateUserRole: async (id: string, role: string) => {
    const dispatch = useDispatch()

    try {
      const userRole = (await client.service('user').patch(id, { userRole: role })) as User
      dispatch(UserRoleAction.userRoleUpdated(userRole))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const UserRoleAction = {
  userRoleRetrieved: (data: Paginated<UserRole>) => {
    return {
      type: 'USER_ROLE_RETRIEVED' as const,
      types: data.data
    }
  },
  userRoleCreated: (data: UserRole) => {
    return {
      type: 'USER_ROLE_CREATED' as const,
      types: data
    }
  },
  userRoleUpdated: (data: User) => {
    return {
      type: 'USER_ROLE_UPDATED' as const,
      data: data
    }
  }
}

export type UserActionType = ReturnType<typeof UserRoleAction[keyof typeof UserRoleAction]>
