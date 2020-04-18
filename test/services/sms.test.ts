import assert from 'assert'
import app from '../../src/app'

describe('\'sms\' service', () => {
  it('registered the service', () => {
    const service = app.service('sms')

    assert.ok(service, 'Registered the service')
  })
})
