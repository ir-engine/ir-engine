import app from '../../server/app'

describe('\'License\' service', () => {
  it('registered the service', () => {
    const service = app.service('license')

    expect(service).toBeTruthy()
  })
})
