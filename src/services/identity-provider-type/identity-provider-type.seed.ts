export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: false,
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
