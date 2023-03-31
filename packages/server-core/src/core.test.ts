import assert from 'assert'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { createFeathersExpressApp } from './createApp'

describe('Core', () => {
  it('should initialise app', async () => {
    const app = createFeathersExpressApp()
    await app.setup()
    assert.ok(app.isSetup)
  })
  after(() => {
    return destroyEngine()
  })
})
