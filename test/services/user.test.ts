import app from '../../server/app'

describe('\'User\' service', () => {
  it('registered the service', () => {
    const service = app.service('user')

    expect(service).toBeTruthy()
  })
})
