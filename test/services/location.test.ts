import app from '../../server/app'

describe('\'Location\' service', () => {
  it('registered the service', () => {
    const service = app.service('location')
    expect(service).toBeTruthy()
  })
})
