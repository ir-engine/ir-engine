import app from '../../server/app'

describe('\'UserRelationshipType\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-relationship-type')

    expect(service).toBeTruthy()
  })
})
