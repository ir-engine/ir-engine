import app from '../../packages/server/src/app'

describe("'location-type' service", () => {
  it('registered the service', () => {
    const service = app.service('location-type')
    expect(service).toBeTruthy()
  })
})
