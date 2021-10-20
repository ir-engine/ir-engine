import app from '../../packages/server/src/app'

describe('\'StaticResource\' service', () => {
  it('registered the service', () => {
    const service = app.service('static-resource')

    expect(service).toBeTruthy()
  })
})
