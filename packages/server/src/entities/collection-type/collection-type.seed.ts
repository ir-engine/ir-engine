import config from '../../config';
import { collectionType } from '../../enums/collection';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'collection-type',
  randomize: false,
  templates:
    [
      { type: collectionType.scene },
      { type: collectionType.inventory },
      { type: collectionType.project }
    ]
};

export default seed;
