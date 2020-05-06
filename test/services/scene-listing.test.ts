import assert from 'assert'
import app from '../../src/app'

describe('\'SceneListing\' service', () => {
  it('registered the service', () => {
    const service = app.service('scene-listing')

    assert.ok(service, 'Registered the service')
  })
})
