import app from '../../packages/server/src/app'

describe('\'Component\' service', () => {
  it('registered the service', () => {
    const service = app.service('component')

    expect(service).toBeTruthy()
  })
})
