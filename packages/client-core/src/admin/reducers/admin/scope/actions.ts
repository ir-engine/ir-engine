import { SCOPE_FETCHING, SCOPE_ADMIN_RETRIEVED, ADD_SCOPE } from '../../actions'

export interface FetchingAction {
  type: string
}

export interface ScopeRetrieveAction {
  type: string
  list: any[]
}

export interface ScopeOneAction {
  type: string
  item: any
}

export type ScopeAction = ScopeRetrieveAction

export function fetchingScope(): FetchingAction {
  return {
    type: SCOPE_FETCHING
  }
}

export function setAdminScope(list: any[]): ScopeRetrieveAction {
  return {
    type: SCOPE_ADMIN_RETRIEVED,
    list
  }
}

export function addAdminScope(item): ScopeOneAction {
  return {
    type: ADD_SCOPE,
    item
  }
}
