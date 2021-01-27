import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'invite-type',
  randomize: false,
  templates:
        [
          { type: 'friend' },
          { type: 'group' },
          { type: 'party' }
        ]
};

export default seed;
