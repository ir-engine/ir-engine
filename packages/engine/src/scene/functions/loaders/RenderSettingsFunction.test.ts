import assert from 'assert'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { deserializeRenderSetting } from './RenderSettingsFunction'

describe('RenderSettingFunctions', () => {
  it('deserializeRenderSetting', () => {
    const world = createWorld()
    Engine.instance.currentWorld = world
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
