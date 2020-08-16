import app from '../../app'

describe('\'subscription-confirm\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscription-confirm')

    expect(service).toBeTruthy()
  })
})
