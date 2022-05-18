import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { createState, useState } from '@hookstate/core'
import { UserRole } from '@xrengine/common/src/interfaces/UserRole'
import { User } from '@xrengine/common/src/interfaces/User'
import { UserRoleResult } from '@xrengine/common/src/interfaces/UserRoleResult'

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
        return s.merge({ userRole: action.types.data, updateNeeded: false })
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
export const UserROleService = {
  fetchUserRole: async () => {
    const dispatch = useDispatch()
    {
      try {
        const userRole = await client.service('user-role').find()
        dispatch(UserRoleAction.userRoleRetrieved(userRole))
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
      dispatch(UserRoleAction.userRoleCreated(result))
    }
  },
  updateUserRole: async (id: string, role: string) => {
    const dispatch = useDispatch()
    {
      try {
        const userRole = await client.service('user').patch(id, { userRole: role })
        dispatch(UserRoleAction.userRoleUpdated(userRole))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
export const UserRoleAction = {
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
  userRoleUpdated: (data: User) => {
    return {
      type: 'USER_ROLE_UPDATED' as const,
      data: data
    }
  }
}

export type UserActionType = ReturnType<typeof UserRoleAction[keyof typeof UserRoleAction]>
