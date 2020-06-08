import assert from 'assert'
import app from '../../src/app'

describe('\'MagicLink\' service', () => {
  it('registered the service', () => {
    const service = app.service('magic-link')

    assert.ok(service, 'Registered the service')
  })
})
