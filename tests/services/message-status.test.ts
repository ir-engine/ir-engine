import app from '../../app'

describe('\'message-status\' service', () => {
  it('registered the service', () => {
    const service = app.service('message-status')

    expect(service).toBeTruthy()
  })
})
