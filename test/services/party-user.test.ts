import assert from 'assert'
import app from '../../src/app'

describe('\'PartyUser\' service', () => {
  it('registered the service', () => {
    const service = app.service('party-user')

    assert.ok(service, 'Registered the service')
  })
})
