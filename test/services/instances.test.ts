import assert from 'assert'
import app from '../../src/app'

describe('\'Instances\' service', () => {
  it('registered the service', () => {
    const service = app.service('instances')

    assert.ok(service, 'Registered the service')
  })
})
