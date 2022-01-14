import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { deserializeRenderSetting } from './RenderSettingsFunction'

describe('RenderSettingFunctions', () => {
  it('deserializeRenderSetting', () => {
    const world = createWorld()
    Engine.currentWorld = world
    Engine.isCSMEnabled = false

    const entity = createEntity()

    const sceneComponentData = {
      csm: true
    }
    const sceneComponent: ComponentJson = {
      name: 'renderer-settings',
      props: sceneComponentData
    }

    deserializeRenderSetting(entity, sceneComponent)

    assert.equal(Engine.isCSMEnabled, true)
    // TODO: currently renderer only is created on client

    // TODO: unnecessary once engine global scope is refactored
    Engine.isCSMEnabled = false
  })
})