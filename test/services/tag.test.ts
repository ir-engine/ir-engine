import assert from 'assert'
import app from '../../server/app'

describe('\'tag\' service', () => {
  it('registered the service', () => {
    const service = app.service('tag')

    assert.ok(service, 'Registered the service')
  })
})
