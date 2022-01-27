import app from '../../packages/server/src/app'

describe("'user-settings' service", () => {
  it('registered the service', () => {
    const service = app.service('user-settings')

    expect(service).toBeTruthy()
  })
})
