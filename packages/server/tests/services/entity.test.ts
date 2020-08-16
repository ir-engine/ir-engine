import app from '../../app'

describe('\'Entity\' service', () => {
  it('registered the service', () => {
    const service = app.service('entity')
    expect(service).toBeTruthy()
  })
})
