import assert from 'assert'
import app from '../../src/app'

describe('\'entity\' service', () => {
  it('registered the service', () => {
    const service = app.service('entity')

    assert.ok(service, 'Registered the service')
  })
})
