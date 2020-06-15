import app from '../../server/app'

describe('\'Instance\' service', () => {
  it('registered the service', () => {
    const service = app.service('instance')
    expect(service).toBeTruthy()
  })
})
