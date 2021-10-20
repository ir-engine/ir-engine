import app from '../../packages/server/src/app'

describe('\'SMS\' service', () => {
  it('registered the service', () => {
    const service = app.service('sms')
    expect(service).toBeTruthy()
  })
})
