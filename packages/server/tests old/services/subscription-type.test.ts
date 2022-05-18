import app from '../../packages/server/src/app'

describe("'subscription-type' service", () => {
  it('registered the service', () => {
    const service = app.service('subscription-type')

    expect(service).toBeTruthy()
  })
})
