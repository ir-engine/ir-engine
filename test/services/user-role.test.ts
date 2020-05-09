import assert from 'assert'
import app from '../../src/app'

describe('\'UserRole\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-role')

    assert.ok(service, 'Registered the service')
  })
})
