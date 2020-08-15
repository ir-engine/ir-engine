import app from '../../server/app'

describe('\'subscription-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscription-type')

    expect(service).toBeTruthy()
  })
})
