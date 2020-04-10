import assert from 'assert'
import app from '../../src/app'

describe('\'group\' service', () => {
  it('registered the service', () => {
    const service = app.service('group')

    assert.ok(service, 'Registered the service')
  })
})
