import assert from 'assert'
import app from '../../src/app'

describe('\'user\' service', () => {
  it('registered the service', () => {
    const service = app.service('user')

    assert.ok(service, 'Registered the service')
  })
})
