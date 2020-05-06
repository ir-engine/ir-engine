import assert from 'assert'
import app from '../../src/app'

describe('\'MagicLink\' service', () => {
  it('registered the service', () => {
    const service = app.service('magiclink')

    assert.ok(service, 'Registered the service')
  })
})
