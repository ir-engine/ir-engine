import app from '../../packages/server/src/app'

describe("'accept-invite' service", () => {
  it('registered the service', () => {
    const service = app.service('a-i')
    expect(service).toBeTruthy()
  })
})
