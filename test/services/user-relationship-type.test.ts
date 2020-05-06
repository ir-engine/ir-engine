import assert from 'assert'
import app from '../../src/app'

describe('\'UserRelationshipType\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-relationship-type')

    assert.ok(service, 'Registered the service')
  })
})
