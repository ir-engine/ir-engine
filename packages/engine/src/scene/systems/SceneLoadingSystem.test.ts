import assert from 'assert'

import { destroyEngine } from '../../ecs/classes/Engine'
import { createEngine } from '../../initializeEngine'

describe('SceneLoadingSystem', () => {
  beforeEach(() => {
    createEngine()
  })

  it('updateSceneFromJSON', async () => {
    assert(true)
  })

  afterEach(() => {
    return destroyEngine()
  })
})
