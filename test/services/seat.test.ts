import assert from 'assert'
import app from '../../src/app'

describe('\'seat\' service', () => {
  it('registered the service', () => {
    const service = app.service('seat')

    assert.ok(service, 'Registered the service')
  })
})
