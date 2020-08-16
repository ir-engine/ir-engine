import app from '../../app'

describe('\'MagicLink\' service', () => {
  it('registered the service', () => {
    const service = app.service('magic-link')
    expect(service).toBeTruthy()
  })
})
