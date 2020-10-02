import app from '../../packages/server/src/app'

describe('\'UserRole\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-role')

    expect(service).toBeTruthy()
  })
})
