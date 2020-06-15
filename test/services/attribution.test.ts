import app from '../../server/app'

describe('\'attribution\' service', () => {
  it('registered the service', () => {
    const service = app.service('attribution')

    expect(service).toBeTruthy()
  })
})
