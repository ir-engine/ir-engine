import assert from 'assert'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

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
    const sceneComponent: ComponentJson = {
      name: 'renderer-settings',
      props: sceneComponentData
    }

    deserializeRenderSetting(entity, sceneComponent)

    assert.equal(EngineRenderer.instance.isCSMEnabled, false)
    // TODO: currently renderer only is created on client

    // TODO: unnecessary once engine global scope is refactored
    EngineRenderer.instance.isCSMEnabled = false
  })
})
