import assert from 'assert'
import app from '../../src/app'

describe('\'ConversationType\' service', () => {
  it('registered the service', () => {
    const service = app.service('conversation-type')

    assert.ok(service, 'Registered the service')
  })
})
