import app from '../../packages/server/src/app'

describe('\'MediaSearch\' service', () => {
  it('registered the service', () => {
    const service = app.service('media-search')

    expect(service).toBeTruthy()
  })
})
