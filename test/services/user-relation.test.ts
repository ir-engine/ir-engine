import assert from 'assert'
import app from '../../src/app'

describe('\'user-relation\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-relation')

    assert.ok(service, 'Registered the service')
  })
})
