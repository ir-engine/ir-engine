import app from '../../app'

describe('\'user-settings\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-settings')

    expect(service).toBeTruthy()
  })
})
