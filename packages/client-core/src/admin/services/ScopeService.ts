import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { createState, useState } from '@speigg/hookstate'
import { AdminScopeResult } from '@xrengine/common/src/interfaces/AdminScopeResult'
import { AdminScope } from '@xrengine/common/src/interfaces/AdminScope'

//State
export const SCOPE_PAGE_LIMIT = 100

const state = createState({
  scopes: [] as Array<AdminScope>,
  skip: 0,
  limit: SCOPE_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now(),
  fetching: false
})

store.receptors.push((action: ScopeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SCOPE_FETCHING':
        return s.merge({ fetching: true })
      case 'SCOPE_ADMIN_RETRIEVED':
        return s.merge({
          //@ts-ignore
          scope: action.adminScopeResult.data,
          skip: action.adminScopeResult.skip,
          limit: action.adminScopeResult.limit,
          total: action.adminScopeResult.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'ADD_SCOPE':
        return s.merge({ updateNeeded: true })
      case 'UPDATE_SCOPE':
        return s.merge({ updateNeeded: true })

      case 'REMOVE_SCOPE':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessScopeState = () => state

export const useScopeState = () => useState(state) as any as typeof state

//Service
export const ScopeService = {
  createScope: async (scopeItem: any) => {
    const dispatch = useDispatch()
    {
      try {
        const newItem = await client.service('scope').create({
          ...scopeItem
        })
        dispatch(ScopeAction.addAdminScope(newItem))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  getScopeService: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const scopeState = accessScopeState()
      const skip = scopeState.skip.value
      const limit = scopeState.limit.value
      try {
        dispatch(ScopeAction.fetchingScope())
        const list = await client.service('scope').find({
          query: {
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(ScopeAction.setAdminScope(list))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  updateScopeService: async (scopeId, scopeItem) => {
    const dispatch = useDispatch()
    {
      try {
        const updatedScope = await client.service('scope').patch(scopeId, {
          ...scopeItem
        })
        dispatch(ScopeAction.updateAdminScope(updatedScope))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  removeScope: async (scopeId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('scope').remove(scopeId)
        dispatch(ScopeAction.removeScopeItem(scopeId))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}

//Action
export const ScopeAction = {
  fetchingScope: () => {
    return {
      type: 'SCOPE_FETCHING' as const
    }
  },
  setAdminScope: (adminScopeResult: AdminScopeResult) => {
    return {
      type: 'SCOPE_ADMIN_RETRIEVED' as const,
      adminScopeResult: adminScopeResult
    }
  },
  addAdminScope: (adminScope: AdminScope) => {
    return {
      type: 'ADD_SCOPE' as const,
      adminScope: adminScope
    }
  },
  updateAdminScope: (adminScope: AdminScope) => {
    return {
      type: 'UPDATE_SCOPE' as const,
      adminScope: adminScope
    }
  },
  removeScopeItem: (id: string) => {
    return {
      type: 'REMOVE_SCOPE' as const,
      id: id
    }
  }
}

export type ScopeActionType = ReturnType<typeof ScopeAction[keyof typeof ScopeAction]>
