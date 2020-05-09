import assert from 'assert'
import app from '../../src/app'

describe('\'StaticResource\' service', () => {
  it('registered the service', () => {
    const service = app.service('static-resource')

    assert.ok(service, 'Registered the service')
  })
})
