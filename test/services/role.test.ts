import assert from 'assert'
import app from '../../src/app'

describe('\'Role\' service', () => {
  it('registered the service', () => {
    const service = app.service('role')

    assert.ok(service, 'Registered the service')
  })
})
