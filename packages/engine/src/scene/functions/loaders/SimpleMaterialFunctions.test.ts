import { ComponentJson } from '@xrengine/engine/src/common/types/SceneInterface'
import assert from 'assert'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { deserializeSimpleMaterial } from './SimpleMaterialFunctions'

describe('SimpleMaterialFunctions', () => {
  it('deserializeSimpleMaterial', async () => {
    const world = createWorld()
    Engine.currentWorld = world

    const entity = createEntity()
    const sceneComponentData = {
      simpleMaterials: true
    }
    const sceneComponent: ComponentJson = {
      name: 'simple-materials',
      props: sceneComponentData
    }

    deserializeSimpleMaterial(entity, sceneComponent)

    assert(Engine.simpleMaterials)

    // todo: this will be unnecessary when engine global state is refactored
    Engine.simpleMaterials = false
  })
})
