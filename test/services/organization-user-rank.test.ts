import assert from 'assert'
import app from '../../src/app'

describe('\'GroupUserRank\' service', () => {
  it('registered the service', () => {
    const service = app.service('group-user-rank')

    assert.ok(service, 'Registered the service')
  })
})
