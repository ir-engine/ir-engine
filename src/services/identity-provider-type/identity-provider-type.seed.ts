import config from '../../../src/config'

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'identity-provider-type',
  randomize: false,
  templates:
        [
          { type: 'email' },
          { type: 'sms' },
          { type: 'password' },
          { type: 'github' },
          { type: 'google' },
          { type: 'facebook' },
          { type: 'auth0' }
        ]
}

export default seed
