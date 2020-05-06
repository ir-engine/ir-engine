import assert from 'assert'
import app from '../../src/app'

describe('\'GroupUser\' service', () => {
  it('registered the service', () => {
    const service = app.service('group-user')
    assert.ok(service, 'Registered the service')
  })
})
