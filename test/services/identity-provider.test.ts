import assert from 'assert'
import app from '../../src/app'

describe('\'identity-provider\' service', () => {
  it('registered the service', () => {
    const service = app.service('identity-provider')

    assert.ok(service, 'Registered the service')
  })
})
