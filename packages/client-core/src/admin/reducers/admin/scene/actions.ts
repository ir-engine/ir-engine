import { ADMIN_SCENES_RETRIEVED } from '../../actions'

export interface CollectionsFetchedAction {
  type: string
  collections: any[]
}

export function collectionsFetched(collections: any[]): CollectionsFetchedAction {
  return {
    type: ADMIN_SCENES_RETRIEVED,
    collections: collections
  }
}
