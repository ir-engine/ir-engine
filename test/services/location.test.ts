import assert from 'assert'
import app from '../../src/app'

describe('\'Location\' service', () => {
  it('registered the service', () => {
    const service = app.service('location')

    assert.ok(service, 'Registered the service')
  })
})
