import { collectionType } from './collectionType'

export const collectionTypeSeed = {
  path: 'collection-type',
  randomize: false,
  templates: [{ type: collectionType.scene }, { type: collectionType.inventory }]
}
