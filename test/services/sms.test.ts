import app from '../../server/app'

describe('\'SMS\' service', () => {
  it('registered the service', () => {
    const service = app.service('sms')
    expect(service).toBeTruthy()
  })
})
