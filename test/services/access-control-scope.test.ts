import assert from 'assert'
import app from '../../src/app'

describe('\'AccessControlScope\' service', () => {
  it('registered the service', () => {
    const service = app.service('access-control-scope')

    assert.ok(service, 'Registered the service')
  })
})
