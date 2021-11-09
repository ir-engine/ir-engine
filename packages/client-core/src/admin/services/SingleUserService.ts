import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { createState, useState } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { User } from '@xrengine/common/src/interfaces/User'
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
  singleUser: UserSeed as User
})

store.receptors.push((action: UserActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SINGLE_USER_ADMIN_LOADED':
        return s.merge({ singleUser: action.data, retrieving: false, fetched: true, updateNeeded: false })
      case 'SINGLE_USER_ADMIN_REFETCH':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessSingleUserState = () => state

export const useSingleUserState = () => useState(state) as any as typeof state

//Service
export const SingleUserService = {
  fetchSingleUserAdmin: async (id: string) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('user').get(id)
        dispatch(SingleUserAction.fetchedSingleUser(result))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  refetchSingleUserAdmin: async () => {}
}

//Action
export const SingleUserAction = {
  fetchedSingleUser: (data: User) => {
    return {
      type: 'SINGLE_USER_ADMIN_LOADED' as const,
      data: data
    }
  },
  refetchSingleUser: () => {
    return {
      type: 'SINGLE_USER_ADMIN_REFETCH' as const
    }
  }
}

export type UserActionType = ReturnType<typeof SingleUserAction[keyof typeof SingleUserAction]>
