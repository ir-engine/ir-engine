import assert from 'assert'
import app from '../../src/app'

describe('\'resource-child\' service', () => {
  it('registered the service', () => {
    const service = app.service('resource-child')

    assert.ok(service, 'Registered the service')
  })
})
