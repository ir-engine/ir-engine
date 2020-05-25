import assert from 'assert'
import app from '../../src/app'

describe('\'Meta\' service', () => {
  it('registered the service', () => {
    const service = app.service('meta')

    assert.ok(service, 'Registered the service')
  })
})
