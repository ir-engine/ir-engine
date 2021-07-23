import app from '../../packages/server/src/app'

describe('\'collection\' service', () => {
  it('registered the service', () => {
    const service = app.service('collection')
    expect(service).toBeTruthy()
  })
})
