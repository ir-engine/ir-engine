import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'channel-type',
  randomize: false,
  templates:
        [
          { type: 'user' },
          { type: 'group' },
          { type: 'party' },
          { type: 'instance' }
        ]
};

export default seed;
