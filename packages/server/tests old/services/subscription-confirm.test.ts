import app from '../../packages/server/src/app'

describe("'subscription-confirm' service", () => {
  it('registered the service', () => {
    const service = app.service('subscription-confirm')

    expect(service).toBeTruthy()
  })
})
