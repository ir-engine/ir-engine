import assert from 'assert'
import app from '../../src/app'

describe('\'conversation\' service', () => {
  it('registered the service', () => {
    const service = app.service('conversation')

    assert.ok(service, 'Registered the service')
  })
})
