import app from '../../packages/server/app'

describe('\'StaticResource\' service', () => {
  it('registered the service', () => {
    const service = app.service('static-resource')

    expect(service).toBeTruthy()
  })
})
