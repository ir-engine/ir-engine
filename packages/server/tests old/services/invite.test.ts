import app from '../../packages/server/src/app'

describe("'invite' service", () => {
  it('registered the service', () => {
    const service = app.service('invite')
    expect(service).toBeTruthy()
  })
})
