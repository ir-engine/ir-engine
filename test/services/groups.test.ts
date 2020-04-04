import assert from 'assert'
import app from '../../src/app'

describe('\'groups\' service', () => {
  it('registered the service', () => {
    const service = app.service('groups')

    assert.ok(service, 'Registered the service')
  })
})
