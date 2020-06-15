import app from '../../server/app'

describe('\'Party\' service', () => {
  it('registered the service', () => {
    const service = app.service('party')

    expect(service).toBeTruthy()
  })
})
