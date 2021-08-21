import app from '../../packages/server/src/app'

describe('\'resolve-media\' service', () => {
  it('registered the service', () => {
    const service = app.service('resolve-media')

    expect(service).toBeTruthy()
  })
})
