import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  randomize: false,
  path: 'user-role',
  templates:
    [
      { role: 'admin' },
      { role: 'moderator' },
      { role: 'user' },
      { role: 'guest' },
      { role: 'location-admin' }
    ]
};

export default seed;
