import assert from 'assert'
import app from '../../src/app'

describe('\'xravatars\' service', () => {
  it('registered the service', () => {
    const service = app.service('avatars')

    assert.ok(service, 'Registered the service')
  })
})
