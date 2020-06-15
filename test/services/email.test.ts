import app from '../../server/app'

describe('\'Email\' service', () => {
  it('registered the service', () => {
    const service = app.service('email')
    expect(service).toBeTruthy()
  })
})
