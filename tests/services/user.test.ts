import app from '../../app'

describe('\'User\' service', () => {
  it('registered the service', () => {
    const service = app.service('user')

    expect(service).toBeTruthy()
  })
})
