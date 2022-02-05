import app from '../../packages/server/src/app'

describe("'Instance' service", () => {
  it('registered the service', () => {
    const service = app.service('instance')
    expect(service).toBeTruthy()
  })
})
