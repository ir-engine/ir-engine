/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import {
  ARMEDIA_ADMIN_RETRIEVED,
  ARMEDIA_FETCHING,
  ARMEDIA_RETRIEVED,
  ARMEDIA_FETCHING_ITEM,
  ARMEDIA_RETRIEVED_ITEM,
  ADD_ARMEDIA,
  REMOVE_ARMEDIA,
  UPDATE_AR_MEDIA
} from '../actions'

export interface ArMediaRetriveAction {
  type: string
  list: any[]
}
export interface ArMediaOneAction {
  type: string
  item: any
}

export interface FetchingAction {
  type: string
}

export interface FetchingArMediaItemAction {
  type: string
  id: string
}

export interface ArMediaRetrievedItemAction {
  type: string
  item: any
}

export type ArMediaAction =
  | ArMediaRetriveAction
  | FetchingAction
  | ArMediaOneAction
  | FetchingArMediaItemAction
  | ArMediaRetrievedItemAction

export function setAdminArMedia(list: any[]): ArMediaRetriveAction {
  return {
    type: ARMEDIA_ADMIN_RETRIEVED,
    list
  }
}

export function setArMedia(list: any[]): ArMediaRetriveAction {
  return {
    type: ARMEDIA_RETRIEVED,
    list
  }
}

export function fetchingArMedia(): FetchingAction {
  return {
    type: ARMEDIA_FETCHING
  }
}

export function addAdminArMedia(item): ArMediaOneAction {
  return {
    type: ADD_ARMEDIA,
    item
  }
}

export function removeArMediaItem(id): FetchingArMediaItemAction {
  return {
    type: REMOVE_ARMEDIA,
    id
  }
}

export function fetchingArMediaItem(id: string): FetchingArMediaItemAction {
  return {
    type: ARMEDIA_FETCHING_ITEM,
    id
  }
}

export function retrievedArMediaItem(item): ArMediaRetrievedItemAction {
  return {
    type: ARMEDIA_RETRIEVED_ITEM,
    item
  }
}

export function updateAdminArMedia(result): ArMediaAction {
  return {
    type: UPDATE_AR_MEDIA,
    item: result
  }
}
