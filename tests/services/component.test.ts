import app from '../../packages/server/app'

describe('\'Component\' service', () => {
  it('registered the service', () => {
    const service = app.service('component')

    expect(service).toBeTruthy()
  })
})
