import assert from 'assert'
import app from '../../src/app'

describe('\'relationship-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('relationship-type')

    assert.ok(service, 'Registered the service')
  })
})
