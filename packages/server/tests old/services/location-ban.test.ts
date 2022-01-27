import app from '../../packages/server/src/app'

describe("'location-ban' service", () => {
  it('registered the service', () => {
    const service = app.service('location-ban')
    expect(service).toBeTruthy()
  })
})
