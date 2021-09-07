import app from '../../packages/server/src/app'

describe('\'Location\' service', () => {
  it('registered the service', () => {
    const service = app.service('location')
    expect(service).toBeTruthy()
  })
})
