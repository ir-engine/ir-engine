import app from '../../app'

describe('\'Party\' service', () => {
  it('registered the service', () => {
    const service = app.service('party')

    expect(service).toBeTruthy()
  })
})
