import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'user-relationship-type',
  randomize: false,
  templates:
    [
      { type: 'requested' }, // Default state of relatedUser
      { type: 'friend' },
      { type: 'blocking' }, // Blocking another user
      { type: 'blocked' } // Blocked by other user
    ]
};

export default seed;
