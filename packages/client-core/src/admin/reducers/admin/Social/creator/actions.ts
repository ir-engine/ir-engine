import {
  RETRIEVE_CREATOR_AS_ADMIN,
  CREATE_CREATOR_AS_ADMIN,
  ADD_CREATOR_AS_ADMIN,
  REMOVE_CREATOR,
  UPDATE_CREATOR
} from '../../../actions'

import { Creator, CreatorShort } from '@xrengine/common/src/interfaces/Creator'

export interface CreatorRetrievedAction {
  type: string
  creator: Creator
}
export interface FetchingCreatorItemAction {
  type: string
  id: string
}

export interface CreatorOneAction {
  type: string
  item: any
}

export type CreatorAction =
  | CreatorRetrievedAction
  | CreatorRetrievedAction
  | FetchingCreatorItemAction
  | CreatorOneAction

export function creatorLoggedRetrieved(creator: Creator): CreatorRetrievedAction {
  return {
    type: RETRIEVE_CREATOR_AS_ADMIN,
    creator
  }
}

export function creatorRetrieved(creator: Creator): CreatorRetrievedAction {
  return {
    type: CREATE_CREATOR_AS_ADMIN,
    creator
  }
}

export function add_creator(creator: Creator): CreatorRetrievedAction {
  return {
    type: ADD_CREATOR_AS_ADMIN,
    creator
  }
}

export function removeCreator(id: string): FetchingCreatorItemAction {
  return {
    type: REMOVE_CREATOR,
    id
  }
}

export function updateAdminCreator(result): CreatorAction {
  return {
    type: UPDATE_CREATOR,
    item: result
  }
}
