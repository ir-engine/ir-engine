import assert from 'assert'
import app from '../../src/app'

describe('\'subscription-confirm\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscription-confirm')

    assert.ok(service, 'Registered the service')
  })
})
