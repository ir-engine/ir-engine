import { ADD_ARMEDIA, UPDATE_AR_MEDIA, REMOVE_ARMEDIA, ARMEDIA_FETCHING, ARMEDIA_ADMIN_RETRIEVED } from '../actions'

export interface ArMediaOneAction {
  type: string
  item: any
}
export interface ArMediaRetriveAction {
  type: string
  list: any[]
}

export interface ArMediaRetrievedItemAction {
  type: string
  item: any
}
export interface FetchingArMediaItemAction {
  type: string
  id: string
}
export interface FetchingAction {
  type: string
}

export type ArMediaAction = ArMediaOneAction | ArMediaRetriveAction | FetchingArMediaItemAction

export function setAdminArMedia(list: any[]): ArMediaRetriveAction {
  return {
    type: ARMEDIA_ADMIN_RETRIEVED,
    list
  }
}
export function removeArMediaItem(id): FetchingArMediaItemAction {
  return {
    type: REMOVE_ARMEDIA,
    id
  }
}

export function addAdminArMedia(item): ArMediaOneAction {
  return {
    type: ADD_ARMEDIA,
    item
  }
}
export function updateAdminArMedia(result): ArMediaAction {
  return {
    type: UPDATE_AR_MEDIA,
    item: result
  }
}

export function fetchingArMedia(): FetchingAction {
  return {
    type: ARMEDIA_FETCHING
  }
}
