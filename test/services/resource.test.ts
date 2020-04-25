import assert from 'assert'
import app from '../../src/app'

describe('\'static-resource\' service', () => {
  it('registered the service', () => {
    const service = app.service('static_resource')

    assert.ok(service, 'Registered the service')
  })
})
