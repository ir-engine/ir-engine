import { createState, useState, none, Downgraded } from '@hookstate/core'
import { ScopeActionType } from './ScopeActions'
import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { AdminScope } from '@xrengine/common/src/interfaces/AdminScope'
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
    lastFetched: new Date()
  },
  scopeType: {
    scopeType: [] as Array<AdminScopeType>,
    skip: 0,
    limit: SCOPE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  fetching: false
})

export const adminScopeReducer = (_, action: ScopeActionType) => {
  Promise.resolve().then(() => scopeReceptor(action))
  return state.attach(Downgraded).value
}

const scopeReceptor = (action: ScopeActionType): any => {
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
          lastFetched: new Date()
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
          lastFetched: new Date()
        })
    }
  }, action.type)
}

export const accessScopeState = () => state
export const useScopeState = () => useState(state) as any as typeof state
