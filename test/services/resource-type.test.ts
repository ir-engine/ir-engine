import assert from 'assert'
import app from '../../src/app'

describe('\'ResourceType\' service', () => {
  it('registered the service', () => {
    const service = app.service('resource-type')

    assert.ok(service, 'Registered the service')
  })
})
