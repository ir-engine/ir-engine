import app from '../../packages/server/app'

describe('\'UserRelationshipType\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-relationship-type')

    expect(service).toBeTruthy()
  })
})
