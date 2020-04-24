import assert from 'assert'
import app from '../../src/app'

describe('\'entity-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('entity-type')
    assert.ok(service, 'Registered the service')
  })
})
