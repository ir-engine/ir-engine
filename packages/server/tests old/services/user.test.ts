import app from '../../packages/server/src/app'

describe("'User' service", () => {
  it('registered the service', () => {
    const service = app.service('user')

    expect(service).toBeTruthy()
  })
})
