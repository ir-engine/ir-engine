export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'identity-provider-type',
  randomize: false,
  templates:
        [
          { name: 'email' },
          { name: 'sms' },
          { name: 'password' },
          { name: 'github' },
          { name: 'google' },
          { name: 'facebook' },
          { name: 'auth0' }
        ]
}

export default seed
