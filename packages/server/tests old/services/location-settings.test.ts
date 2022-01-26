import assert from 'assert'
import app from '../../packages/server/src/app'

describe("'location-settings' service", () => {
  it('registered the service', () => {
    const service = app.service('location-settings')

    assert.ok(service, 'Registered the service')
  })
})
