import assert from 'assert'
import app from '../../src/app'

describe('\'project\' service', () => {
  it('registered the service', () => {
    const service = app.service('project')

    assert.ok(service, 'Registered the service')
  })
})
