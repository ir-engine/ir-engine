import assert from 'assert'

import { createFeathersExpressApp } from './createApp'

describe('Core', () => {
  it('should initialise app', async () => {
    const app = await createFeathersExpressApp()
    assert.doesNotReject(app.setup())
    assert.doesNotReject(app.isSetup)
  })
})
