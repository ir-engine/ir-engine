import app from '../../server/app'

describe('\'UserRole\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-role')

    expect(service).toBeTruthy()
  })
})
