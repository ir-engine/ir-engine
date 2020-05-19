import assert from 'assert'
import app from '../../src/app'

describe('\'chatroom\' service', () => {
  it('registered the service', () => {
    const service = app.service('chatroom')

    assert.ok(service, 'Registered the service')
  })
})
