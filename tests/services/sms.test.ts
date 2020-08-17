import app from '../../app'

describe('\'SMS\' service', () => {
  it('registered the service', () => {
    const service = app.service('sms')
    expect(service).toBeTruthy()
  })
})
