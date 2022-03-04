import assert from 'assert'

import { createApp } from '../../server/src/app'

describe('Core', () => {
  it('should initialise app', async () => {
    const app = createApp()
    assert.doesNotReject(app.setup())
    assert.doesNotReject(app.isSetup)
  })
})
