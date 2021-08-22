import app from '../../packages/server/src/app'

describe('\'message-status\' service', () => {
  it('registered the service', () => {
    const service = app.service('message-status')

    expect(service).toBeTruthy()
  })
})
