import assert from 'assert'
import app from '../../src/app'

describe('\'user-settings\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-settings')

    assert.ok(service, 'Registered the service')
  })
})
