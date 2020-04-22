import assert from 'assert'
import app from '../../src/app'

describe('\'license\' service', () => {
  it('registered the service', () => {
    const service = app.service('license')

    assert.ok(service, 'Registered the service')
  })
})
