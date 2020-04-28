import assert from 'assert'
import app from '../../src/app'

describe('\'ProjectAsset\' service', () => {
  it('registered the service', () => {
    const service = app.service('project-asset')

    assert.ok(service, 'Registered the service')
  })
})
