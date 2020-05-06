import assert from 'assert'
import app from '../../src/app'

describe('\'AuthManagement\' service', () => {
  it('registered the service', () => {
    const service = app.service('auth-management')

    assert.ok(service, 'Registered the service')
  })
})
