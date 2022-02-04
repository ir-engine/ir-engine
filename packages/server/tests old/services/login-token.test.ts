import app from '../../packages/server/src/app'

describe("'login-token' service", () => {
  it('registered the service', () => {
    const service = app.service('login-token')
    expect(service).toBeTruthy()
  })
})
