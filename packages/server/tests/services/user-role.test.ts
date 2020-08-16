import app from '../../app'

describe('\'UserRole\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-role')

    expect(service).toBeTruthy()
  })
})
