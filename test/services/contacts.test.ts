import assert from 'assert'
import app from '../../src/app'

describe('\'contact\' service', () => {
  it('registered the service', () => {
    const service = app.service('contact')

    assert.ok(service, 'Registered the service')
  })
})
