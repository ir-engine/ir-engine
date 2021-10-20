import app from '../../packages/server/src/app'

describe('\'CollectionType\' service', () => {
  it('registered the service', () => {
    const service = app.service('collection-type')
    expect(service).toBeTruthy()
  })
})
