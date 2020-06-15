import app from '../../server/app'

describe('\'tag\' service', () => {
  it('registered the service', () => {
    const service = app.service('tag')
    expect(service).toBeTruthy()
  })
})
