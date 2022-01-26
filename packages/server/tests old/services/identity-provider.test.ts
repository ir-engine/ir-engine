import app from '../../packages/server/src/app'

describe("'IdentityProvider' service", () => {
  it('registered the service', () => {
    const service = app.service('identity-provider')
    expect(service).toBeTruthy()
  })
})
