import { RETRIEVE_CREATOR_AS_ADMIN, CREATE_CREATOR_AS_ADMIN } from '../../../actions'

import { Creator, CreatorShort } from '@xrengine/common/src/interfaces/Creator'

export interface CreatorRetrievedAction {
  type: string
  creator: Creator
}

export type CreatorAction = CreatorRetrievedAction

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
