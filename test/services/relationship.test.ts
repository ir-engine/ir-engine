import assert from 'assert'
import app from '../../src/app'

describe('\'relationship\' service', () => {
  it('registered the service', () => {
    const service = app.service('relationship')

    assert.ok(service, 'Registered the service')
  })
})
