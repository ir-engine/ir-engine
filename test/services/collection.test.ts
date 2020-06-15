import app from '../../server/app'

describe('\'collection\' service', () => {
  it('registered the service', () => {
    const service = app.service('collection')
    expect(service).toBeTruthy()
  })
})
