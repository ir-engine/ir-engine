import app from '../../app'

describe('\'Location\' service', () => {
  it('registered the service', () => {
    const service = app.service('location')
    expect(service).toBeTruthy()
  })
})
