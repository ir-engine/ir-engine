import assert from 'assert'
import app from '../../src/app'

describe('\'XrScenes\' service', () => {
  it('registered the service', () => {
    const service = app.service('scenes')

    assert.ok(service, 'Registered the service')
  })
})
