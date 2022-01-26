import app from '../../packages/server/src/app'

describe("'rtc-ports' service", () => {
  it('registered the service', () => {
    const service = app.service('rtc-ports')
    expect(service).toBeTruthy()
  })
})
