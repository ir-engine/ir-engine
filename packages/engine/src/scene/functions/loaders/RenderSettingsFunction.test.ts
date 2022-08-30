import assert from 'assert'

import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { deserializeRenderSetting } from './RenderSettingsFunction'

describe('RenderSettingFunctions', () => {
  it('deserializeRenderSetting', () => {
    createEngine()
    EngineRenderer.instance.isCSMEnabled = false

    const entity = createEntity()

    const sceneComponentData = {
      csm: true
    }

    deserializeRenderSetting(entity, sceneComponentData)

    assert.equal(EngineRenderer.instance.isCSMEnabled, false)
    // TODO: currently renderer only is created on client

    // TODO: unnecessary once engine global scope is refactored
    EngineRenderer.instance.isCSMEnabled = false
  })
})
