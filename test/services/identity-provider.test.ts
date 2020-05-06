import assert from 'assert'
import app from '../../src/app'

describe('\'IdentityProvider\' service', () => {
  it('registered the service', () => {
    const service = app.service('identity-provider')

    assert.ok(service, 'Registered the service')
  })
})
