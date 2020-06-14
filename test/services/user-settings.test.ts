import app from '../../server/app'

describe('\'user-settings\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-settings')

    expect(service).toBeTruthy()
  })
})
