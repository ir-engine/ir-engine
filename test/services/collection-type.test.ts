import app from '../../server/app'

describe('\'CollectionType\' service', () => {
  it('registered the service', () => {
    const service = app.service('collection-type')
    expect(service).toBeTruthy()
  })
})
