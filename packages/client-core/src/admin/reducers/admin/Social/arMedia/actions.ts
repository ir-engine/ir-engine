import {
  ADD_ARMEDIA,
  UPDATE_AR_MEDIA,
  REMOVE_ARMEDIA,
  ARMEDIA_FETCHING,
  ARMEDIA_ADMIN_RETRIEVED
} from '../../../actions'

export interface AdminArMediaOneAction {
  type: string
  item: any
}
export interface AdminArMediaRetriveAction {
  type: string
  list: any[]
}

export interface AdminArMediaRetrievedItemAction {
  type: string
  item: any
}
export interface AdminFetchingArMediaItemAction {
  type: string
  id: string
}
export interface AdminFetchingAction {
  type: string
}

export type AdminArMediaAction = AdminArMediaOneAction | AdminArMediaRetriveAction | AdminFetchingArMediaItemAction

export function setAdminArMedia(list: any[]): AdminArMediaRetriveAction {
  return {
    type: ARMEDIA_ADMIN_RETRIEVED,
    list
  }
}
export function removeArMediaItem(id): AdminFetchingArMediaItemAction {
  return {
    type: REMOVE_ARMEDIA,
    id
  }
}

export function addAdminArMedia(item): AdminArMediaOneAction {
  return {
    type: ADD_ARMEDIA,
    item
  }
}
export function updateAdminArMedia(result): AdminArMediaAction {
  return {
    type: UPDATE_AR_MEDIA,
    item: result
  }
}

export function fetchingArMedia(): AdminFetchingAction {
  return {
    type: ARMEDIA_FETCHING
  }
}
