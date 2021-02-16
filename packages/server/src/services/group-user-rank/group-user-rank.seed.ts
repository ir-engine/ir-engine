import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'group-user-rank',
  randomize: false,
  templates:
        [
          { rank: 'owner' },
          { rank: 'admin' },
          { rank: 'user' }
        ]
};

export default seed;
