import assert from 'assert'
import app from '../../src/app'

describe('\'Upload\' service', () => {
  it('registered the service', () => {
    const service = app.service('upload')
    assert.ok(service, 'Registered the service')
  })
})
