import assert from 'assert'

import { createFeathersExpressApp, serverPipe } from './createApp'

describe('Core', () => {
  it('should initialise app', async () => {
    const app = createFeathersExpressApp()
    serverPipe(app)
    assert.doesNotReject(app.setup())
    assert.doesNotReject(app.isSetup)
  })
})
