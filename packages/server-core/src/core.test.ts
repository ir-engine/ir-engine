import assert from 'assert'
import { createApp } from '../../server/src/app'
import { Application } from '../declarations'

describe('Core', () => {
  let app: Application
  before(() => {
    app = createApp()
  })

  it('should initialise app', async () => {
    assert.doesNotReject(app.isSetup)
  })
})
