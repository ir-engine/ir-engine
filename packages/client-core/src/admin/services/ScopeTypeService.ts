import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { createState, useState } from '@speigg/hookstate'
import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { AdminScopTypeResult } from '@xrengine/common/src/interfaces/AdminScopeTypeResult'

//State
export const SCOPE_PAGE_LIMIT = 100

const state = createState({
  skip: 0,
  limit: SCOPE_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now(),
  scopeTypes: [] as Array<AdminScopeType>,
  fetching: false
})

store.receptors.push((action: ScopeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SCOPE_TYPES_RETRIEVED':
        return s.merge({
          scopeTypes: action.adminScopeTypeResult.data,
          skip: action.adminScopeTypeResult.skip,
          limit: action.adminScopeTypeResult.limit,
          total: action.adminScopeTypeResult.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
    }
  }, action.type)
})

export const accessScopeTypeState = () => state

export const useScopeTypeState = () => useState(state) as any as typeof state

//Service
export const ScopeTypeService = {
  getScopeTypeService: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const scopeState = accessScopeTypeState()
      const skip = scopeState.skip.value
      const limit = scopeState.limit.value
      try {
        const result = await client.service('scope-type').find({
          query: {
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(ScopeTypeAction.getScopeTypes(result))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}

//Action
export const ScopeTypeAction = {
  getScopeTypes: (adminScopeTypeResult: AdminScopTypeResult) => {
    return {
      type: 'SCOPE_TYPES_RETRIEVED' as const,
      adminScopeTypeResult: adminScopeTypeResult
    }
  }
}

export type ScopeActionType = ReturnType<typeof ScopeTypeAction[keyof typeof ScopeTypeAction]>
