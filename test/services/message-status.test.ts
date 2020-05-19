import assert from 'assert'
import app from '../../src/app'

describe('\'message-status\' service', () => {
  it('registered the service', () => {
    const service = app.service('message-status')

    assert.ok(service, 'Registered the service')
  })
})
