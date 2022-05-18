import app from '../../packages/server/src/app'

describe('\'ComponentType\' service', () => {
  it('registered the service', () => {
    const service = app.service('component-type')

    expect(service).toBeTruthy()
  })
})
