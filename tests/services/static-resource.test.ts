import app from '../../app'

describe('\'StaticResource\' service', () => {
  it('registered the service', () => {
    const service = app.service('static-resource')

    expect(service).toBeTruthy()
  })
})
