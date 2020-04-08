import assert from 'assert'
import app from '../../src/app'

describe('\'XrLocationInstances\' service', () => {
  it('registered the service', () => {
    const service = app.service('instances')

    assert.ok(service, 'Registered the service')
  })
})
