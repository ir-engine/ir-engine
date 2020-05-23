import assert from 'assert'
import app from '../../src/app'

describe('\'subscription-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscription-type')

    assert.ok(service, 'Registered the service')
  })
})
