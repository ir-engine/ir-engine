import assert from 'assert'
import app from '../../src/app'

describe('\'contacts\' service', () => {
  it('registered the service', () => {
    const service = app.service('contacts')

    assert.ok(service, 'Registered the service')
  })
})
