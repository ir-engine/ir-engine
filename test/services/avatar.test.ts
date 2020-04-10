import assert from 'assert'
import app from '../../src/app'

describe('\'Avatars\' service', () => {
  it('registered the service', () => {
    const service = app.service('avatar')

    assert.ok(service, 'Registered the service')
  })
})
