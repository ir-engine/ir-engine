import assert from 'assert'
import app from '../../src/app'

describe('\'Meta\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/v1/meta')

    assert.ok(service, 'Registered the service')
  })
})
