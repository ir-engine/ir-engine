import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/state/AlertService'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { AdminScopTypeResult } from '@xrengine/common/src/interfaces/AdminScopeTypeResult'
import { AdminScopeResult } from '@xrengine/common/src/interfaces/AdminScopeResult'
import { AdminScope } from '@xrengine/common/src/interfaces/AdminScope'

//State
export const SCOPE_PAGE_LIMIT = 100

const state = createState({
  scope: {
    scope: [] as Array<AdminScope>,
    skip: 0,
    limit: SCOPE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  },
  scopeType: {
    scopeType: [] as Array<AdminScopeType>,
    skip: 0,
    limit: SCOPE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  },
  fetching: false
})

store.receptors.push((action: ScopeActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'SCOPE_FETCHING':
        return s.merge({ fetching: true })
      case 'SCOPE_ADMIN_RETRIEVED':
        result = action.adminScopeResult
        return s.scope.merge({
          scope: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'ADD_SCOPE':
        return s.scope.merge({ updateNeeded: true })
      case 'UPDATE_SCOPE':
        return s.scope.merge({ updateNeeded: true })

      case 'REMOVE_SCOPE':
        return s.scope.merge({ updateNeeded: true })
      case 'SCOPE_TYPE_RETRIEVED':
        result = action.adminScopTypeResult
        return s.scopeType.merge({
          scopeType: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
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
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getScopeService: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const scopeState = accessScopeState()
      const skip = scopeState.scope.skip.value
      const limit = scopeState.scope.limit.value
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
        console.log(err)
        AlertService.dispatchAlertError(err.message)
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
        console.error(err)
        AlertService.dispatchAlertError(err.message)
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
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getScopeTypeService: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const scopeState = accessScopeState()
      const skip = scopeState.scopeType.skip.value
      const limit = scopeState.scopeType.limit.value
      try {
        const result = await client.service('scope-type').find({
          query: {
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(ScopeAction.getScopeType(result))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
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
  },
  getScopeType: (adminScopTypeResult: AdminScopTypeResult) => {
    return {
      type: 'SCOPE_TYPE_RETRIEVED',
      adminScopTypeResult: adminScopTypeResult
    }
  }
}

export type ScopeActionType = ReturnType<typeof ScopeAction[keyof typeof ScopeAction]>
