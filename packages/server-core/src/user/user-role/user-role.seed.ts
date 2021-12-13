import config from '../../appconfig'

export const userRoleSeed = {
  path: 'user-role',
  templates: [{ role: 'admin' }, { role: 'moderator' }, { role: 'user' }, { role: 'guest' }, { role: 'location-admin' }]
}
