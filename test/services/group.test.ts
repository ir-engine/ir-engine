import assert from 'assert'
import app from '../../src/app'

describe('\'party\' service', () => {
  it('registered the service', () => {
    const service = app.service('party')

    assert.ok(service, 'Registered the service')
  })
})
