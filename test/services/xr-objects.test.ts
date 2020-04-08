import assert from 'assert'
import app from '../../src/app'

describe('\'XrObjects\' service', () => {
  it('registered the service', () => {
    const service = app.service('objects')

    assert.ok(service, 'Registered the service')
  })
})
