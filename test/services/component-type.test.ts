import assert from 'assert'
import app from '../../src/app'

describe('\'component-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('component-type')

    assert.ok(service, 'Registered the service')
  })
})
