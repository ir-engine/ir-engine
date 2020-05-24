import assert from 'assert'
import app from '../../src/app'

describe('\'PublishProject\' service', () => {
  it('registered the service', () => {
    const service = app.service('publish-project')

    assert.ok(service, 'Registered the service')
  })
})
