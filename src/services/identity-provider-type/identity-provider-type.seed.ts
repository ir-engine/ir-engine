export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
  path: 'identity-provider-type',
  randomize: false,
  templates:
        [
          { iden: 'email' },
          { type: 'sms' },
          { type: 'password' },
          { type: 'github' },
          { type: 'google' },
          { type: 'facebook' },
          { type: 'auth0' }
        ]
}

export default seed
