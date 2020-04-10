import assert from 'assert'
import app from '../../src/app'

describe('\'Scene\' service', () => {
  it('registered the service', () => {
    const service = app.service('scene')

    assert.ok(service, 'Registered the service')
  })
})
