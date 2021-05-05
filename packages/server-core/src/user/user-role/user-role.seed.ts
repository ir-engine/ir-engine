import config from '../../appconfig';

export const userRoleSeed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  randomize: false,
  path: 'user-role',
  templates:
    [
      { role: 'admin', project_id: 'fW7968K1' },
      { role: 'moderator', project_id: 'fW7968K1' },
      { role: 'user', project_id: 'fW7968K1' },
      { role: 'guest', project_id: 'fW7968K1' },
      { role: 'location-admin', project_id: 'fW7968K1' },
    ]
};
