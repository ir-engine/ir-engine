import assert from 'assert'
import app from '../../src/app'

describe('\'entity-component\' service', () => {
  it('registered the service', () => {
    const service = app.service('entity-component')

    assert.ok(service, 'Registered the service')
  })
})
