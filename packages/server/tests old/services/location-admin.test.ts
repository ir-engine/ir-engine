import app from '../../packages/server/src/app'

describe("'location-admin' service", () => {
  it('registered the service', () => {
    const service = app.service('location-admin')
    expect(service).toBeTruthy()
  })
})
