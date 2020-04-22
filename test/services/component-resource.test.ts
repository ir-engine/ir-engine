import assert from 'assert'
import app from '../../src/app'

describe('\'component-resource\' service', () => {
  it('registered the service', () => {
    const service = app.service('component-resource')

    assert.ok(service, 'Registered the service')
  })
})
