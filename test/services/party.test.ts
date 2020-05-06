import assert from 'assert'
import app from '../../src/app'

describe('\'Party\' service', () => {
  it('registered the service', () => {
    const service = app.service('party')

    assert.ok(service, 'Registered the service')
  })
})
