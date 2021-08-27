import app from '../../packages/server/src/app'

describe('\'Upload\' service', () => {
  it('registered the service', () => {
    const service = app.service('upload')
    expect(service).toBeTruthy()
  })
})
