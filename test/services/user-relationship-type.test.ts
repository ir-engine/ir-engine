import assert from 'assert'
import app from '../../src/app'

describe('\'user-relationship-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-relationship-type')

    assert.ok(service, 'Registered the service')
  })
})
