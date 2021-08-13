import { SCOPE_FETCHING, SCOPE_ADMIN_RETRIEVED, REMOVE_SCOPE, ADD_SCOPE, UPDATE_SCOPE } from '../../actions'

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

export interface FetchingScopeItemAction {
  type: string
  id: string
}

export type ScopeAction = ScopeRetrieveAction | ScopeOneAction | FetchingScopeItemAction

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

export function updateAdminScope(result): ScopeAction {
  return {
    type: UPDATE_SCOPE,
    item: result
  }
}

export function removeScopeItem(id): FetchingScopeItemAction {
  return {
    type: REMOVE_SCOPE,
    id
  }
}
