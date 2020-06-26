import app from '../../server/app'

describe('\'message-status\' service', () => {
  it('registered the service', () => {
    const service = app.service('message-status')

    expect(service).toBeTruthy()
  })
})
