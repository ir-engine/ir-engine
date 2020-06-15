import app from '../../server/app'

describe('\'seat\' service', () => {
  it('registered the service', () => {
    const service = app.service('seat')

    expect(service).toBeTruthy()
  })
})
