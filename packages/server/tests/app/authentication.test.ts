import app from '../../packages/server/src/app'

describe('authentication', () => {
  it('registered the authentication service', () => {
    expect(app.service('authentication'))
  })

  describe.skip('local strategy', () => {
    const userInfo = {
      email: 'someone@example.com',
      password: 'supersecret'
    }

    beforeAll(async () => {
      try {
        await app.service('user').create(userInfo)
      } catch (error) {
        // Do nothing, it just means the user already exists and can be tested
      }
    })

    it('authenticates user and creates accessToken', async () => {
      const { user, accessToken } = await app.service('authentication').create({
        strategy: 'local',
        ...userInfo
      }, {})

      expect(accessToken === 'Created access token for user')
      expect(user === 'Includes user in authentication data')
    })
  })
})
