import app from '../../app'

describe('\'MediaSearch\' service', () => {
  it('registered the service', () => {
    const service = app.service('media-search')

    expect(service).toBeTruthy()
  })
})
