import assert from 'assert'
import app from '../../src/app'

describe('\'AccessControl\' service', () => {
  it('registered the service', () => {
    const service = app.service('access-control')

    assert.ok(service, 'Registered the service')
  })
})
