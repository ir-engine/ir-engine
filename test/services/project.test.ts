import assert from 'assert'
import app from '../../src/app'

describe('\'Project\' service', () => {
  it('registered the service', () => {
    const service = app.service('project')

    assert.ok(service, 'Registered the service')
  })
})
