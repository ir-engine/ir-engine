import config from '../../appconfig'
import { collectionType } from './collectionType'

export const collectionTypeSeed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'collection-type',
  randomize: false,
  templates: [{ type: collectionType.scene }, { type: collectionType.inventory }, { type: collectionType.project }]
}
