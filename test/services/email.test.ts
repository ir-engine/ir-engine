import assert from 'assert'
import app from '../../src/app'

describe('\'Email\' service', () => {
  it('registered the service', () => {
    const service = app.service('email')

    assert.ok(service, 'Registered the service')
  })
})
