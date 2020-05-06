import assert from 'assert'
import app from '../../src/app'

describe('\'Component\' service', () => {
  it('registered the service', () => {
    const service = app.service('component')

    assert.ok(service, 'Registered the service')
  })
})
