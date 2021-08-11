import { GROUP_FETCHING, GROUP_ADMIN_RETRIEVED, ADD_GROUP } from '../../actions'

export interface FetchingAction {
  type: string
}

export interface GroupRetrieveAction {
  type: string
  list: any[]
}

export interface GroupOneAction {
  type: string
  item: any
}

export type GroupAction = GroupRetrieveAction

export function fetchingGroup(): FetchingAction {
  return {
    type: GROUP_FETCHING
  }
}

export function setAdminGroup(list: any[]): GroupRetrieveAction {
  return {
    type: GROUP_ADMIN_RETRIEVED,
    list
  }
}

export function addAdminGroup(item: any): GroupOneAction {
  return {
    type: ADD_GROUP,
    item
  }
}
