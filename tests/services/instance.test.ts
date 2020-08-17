import app from '../../app'

describe('\'Instance\' service', () => {
  it('registered the service', () => {
    const service = app.service('instance')
    expect(service).toBeTruthy()
  })
})
